#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const coverageDir = join(repoRoot, "coverage");
const frontendDir = join(repoRoot, "frontend", "stellart-frontend");
const frontendCoverSummary = join(frontendDir, "coverage", "coverage-summary.json");
const backendCoverProfile = join(coverageDir, "backend.out");
const backendCoverHtml = join(coverageDir, "backend.html");

const target = (process.argv[2] || "all").toLowerCase();

// Statement counts per suite, used to compute a combined overall percentage.
const stats = {};

function pct(covered, total) {
  return total === 0 ? 0 : (covered / total) * 100;
}

// Parse a Go coverage profile (mode: atomic) into covered/total statement counts.
// With -coverpkg=./... the same block can appear multiple times (once per test
// binary), so blocks are deduplicated by location and a block counts as covered
// if any occurrence was hit, matching `go tool cover -func` totals.
function parseGoCoverage(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const blocks = new Map();
  for (const line of lines) {
    if (!line || line.startsWith("mode:")) continue;
    // Format: path/file.go:startLine.col,endLine.col numStatements count
    const match = line.match(/^(.*) (\d+) (\d+)$/);
    if (!match) continue;
    const key = match[1];
    const numStatements = Number(match[2]);
    const hit = Number(match[3]) > 0;
    const prev = blocks.get(key);
    if (prev) {
      prev.covered = prev.covered || hit;
    } else {
      blocks.set(key, { numStatements, covered: hit });
    }
  }
  let covered = 0;
  let total = 0;
  for (const block of blocks.values()) {
    total += block.numStatements;
    if (block.covered) covered += block.numStatements;
  }
  return { covered, total };
}

function readFrontendCoverage(path) {
  const summary = JSON.parse(readFileSync(path, "utf8"));
  const s = summary.total.statements;
  return { covered: s.covered, total: s.total };
}

function run(label, command, args, options = {}) {
  console.log(`\n\u2192 ${label}\n  ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: repoRoot,
    ...options,
  });
  if (result.error) {
    console.error(`  Failed to start "${command}": ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

function runBackend() {
  console.log("\n=== Backend (Go) tests + coverage ===");
  mkdirSync(coverageDir, { recursive: true });

  let status = run("go test", "go", [
    "test",
    "./backend/src/handler/...",
    "./backend/src/service/...",
    "./backend/test/handler/...",
    "-covermode=atomic",
    "-coverpkg=./backend/src/handler/...,./backend/src/service/...",
    `-coverprofile=${backendCoverProfile}`,
  ]);
  if (status !== 0) return status;

  run("coverage summary", "go", ["tool", "cover", `-func=${backendCoverProfile}`]);
  run("coverage html", "go", [
    "tool",
    "cover",
    `-html=${backendCoverProfile}`,
    "-o",
    backendCoverHtml,
  ]);

  try {
    stats.backend = parseGoCoverage(backendCoverProfile);
  } catch (e) {
    console.error(`  Could not read backend coverage: ${e.message}`);
  }

  console.log(`\n  Backend coverage report: ${backendCoverHtml}`);
  return 0;
}

function runFrontend() {
  console.log("\n=== Frontend (Vitest) tests + coverage ===");
  const status = run("vitest run --coverage", "npm", [
    "--prefix",
    frontendDir,
    "run",
    "test:coverage",
  ]);
  if (status === 0) {
    try {
      stats.frontend = readFrontendCoverage(frontendCoverSummary);
    } catch (e) {
      console.error(`  Could not read frontend coverage: ${e.message}`);
    }
    console.log(
      `\n  Frontend coverage report: ${join(frontendDir, "coverage", "index.html")}`
    );
  }
  return status;
}

const steps = [];
if (target === "all" || target === "backend") steps.push(["backend", runBackend]);
if (target === "all" || target === "frontend") steps.push(["frontend", runFrontend]);

if (steps.length === 0) {
  console.error(`Unknown target "${target}". Use: backend | frontend | all`);
  process.exit(1);
}

const failures = [];
for (const [name, fn] of steps) {
  const status = fn();
  if (status !== 0) failures.push(name);
}

console.log("\n=== Summary ===");
for (const [name] of steps) {
  console.log(`  ${failures.includes(name) ? "FAIL" : "PASS"}  ${name}`);
}

console.log("\n=== Coverage (statements) ===");
let combinedCovered = 0;
let combinedTotal = 0;
for (const name of ["backend", "frontend"]) {
  const s = stats[name];
  if (!s) continue;
  combinedCovered += s.covered;
  combinedTotal += s.total;
  console.log(
    `  ${name.padEnd(9)} ${pct(s.covered, s.total).toFixed(2).padStart(6)}%  (${s.covered}/${s.total})`
  );
}
if (combinedTotal > 0) {
  console.log(
    `  ${"OVERALL".padEnd(9)} ${pct(combinedCovered, combinedTotal).toFixed(2).padStart(6)}%  (${combinedCovered}/${combinedTotal})`
  );
}

if (failures.length > 0) {
  console.error(`\nTests failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll tests passed.");

FROM golang:1.25-bookworm AS builder

WORKDIR /src

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

COPY go.mod go.sum ./
RUN go mod download

COPY backend ./backend

ENV CGO_ENABLED=1 GOOS=linux GOARCH=amd64
RUN go build -o /out/server ./backend/main.go

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libc6 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /out/server /app/server
COPY backend /app/backend

ENV PORT=3001
ENV AI_RUNTIME_LIB_PATH=/app/backend/libonnxruntime.so
ENV AI_MODEL_PATH=/app/backend/ai_detector.onnx

EXPOSE 3001

CMD ["/app/server"]

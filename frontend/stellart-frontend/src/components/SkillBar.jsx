import { useState } from "react";

export default function SkillBar({ label, initialValue = 50, color = "bg-yellow-500", onChange }) {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        const newValue = Number(e.target.value);
        setValue(newValue);
        onChange?.(label, newValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 tracking-tight">{label}</span>
                <span className="text-xs font-black text-slate-400 tabular-nums">{value}/100</span>
            </div>
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-300`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={handleChange}
                className="w-full accent-yellow-500 cursor-pointer"
            />
        </div>
    );
}

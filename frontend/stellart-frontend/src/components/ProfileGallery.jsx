const placeholders = Array.from({ length: 6 }, (_, i) => i);

export default function ProfileGallery() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {placeholders.map((i) => (
                <div
                    key={i}
                    className="group relative aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center hover:border-yellow-400 transition-colors"
                >
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                        <span className="text-xs font-bold">Artwork {i + 1}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-2xl" />
                </div>
            ))}
        </div>
    );
}

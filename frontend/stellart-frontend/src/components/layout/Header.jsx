import AvatarDropdown from "../AvatarDropdwon";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            
            <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm shadow-yellow-200">
                <span className="text-black text-xs font-black">S</span>
            </div>
            <div className="text-xl font-black tracking-tighter text-slate-900">
                STELL<span className="text-yellow-500">ART</span>
            </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
                <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">
                    Explore
                </a>
                <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">
                    Comisions
                </a>
                <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">
                    Artists
                </a>
            </nav>

            <div className="flex items-center gap-4">
            <button className="hidden cursor-pointer sm:block text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors">
                Publicar Obra
            </button>
            
            <div className="pl-4 border-l border-slate-100">
                <AvatarDropdown />
            </div>
            </div>

        </div>
        </header>
    );
}
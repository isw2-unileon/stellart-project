export function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-white relative flex flex-col">
            <div 
                className="absolute inset-0 opacity-[0.4] pointer-events-none" 
                style={{ 
                    backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)', 
                    backgroundSize: '24px 24px' 
                }}
            />

            <header className="relative z-10 p-8">
                <a href="/" className="flex items-center gap-2">
                    <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center text-lg">S</div>
                    <span className="font-black text-2xl tracking-tighter text-[#0f172a]">STELLART</span>
                </a>
            </header>

            <main className="relative z-10 flex flex-col items-center px-6 mt-4">
                <div className="inline-block mb-6">
                    <h1 className="text-6xl font-black text-[#0f172a] tracking-tighter">
                        Registrarse
                    </h1>
                    <div className="w-full h-1.5 bg-yellow-500 rounded-full mt-1"></div>
                </div>
                
                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-8 text-center max-w-lg">
                    Saca la <span className="text-yellow-500">estrella</span> dentro de ti
                </p>

                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>
        </div>
    );
}
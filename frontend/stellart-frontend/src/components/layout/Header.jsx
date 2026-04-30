import { useState, useEffect } from "react";
import { getLoggedUser } from "../../service/apiService";
import AvatarDropdown from "../AvatarDropdwon";
import { useLocation, Link } from 'react-router-dom';

export default function Header() {
    const location = useLocation();

    if (location.pathname === "/register" || location.pathname === "/login") {
        return <RegisterHeader/>
    } else {
        return <GeneralHeader />
    }
}

function RegisterHeader() {
    return (
        <header className="relative z-10 p-8">
            <Link to="/" className="flex items-center gap-2">
                <div className="bg-yellow-500 text-black font-black w-10 h-10 rounded-full flex items-center justify-center text-lg">S</div>
                <span className="font-black text-2xl tracking-tighter text-[#0f172a]">STELLART</span>
            </Link>
        </header>
    );
}

function GeneralHeader() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const loggedUser = await getLoggedUser();
            setUser(loggedUser);
        }
        fetchUser();
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
                
                {/* IZQUIERDA: Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm shadow-yellow-200">
                        <span className="text-black text-xs font-black">S</span>
                    </div>
                    <div className="text-xl font-black tracking-tighter text-slate-900">
                        STELL<span className="text-yellow-500">ART</span>
                    </div>
                </Link>

                {/* CENTRO: Menú (Usa flex-1 para tomar el espacio central sin pisar los lados) */}
                <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
                    <Link to="/explore" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Explore</Link>
                    <Link to="/find-artists" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Find Artists</Link>
                    <Link to="/contact" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Support</Link>
                </nav>

                {/* DERECHA: Acciones de usuario */}
                <div className="flex items-center justify-end shrink-0">
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to="/commissions" className="hidden xl:flex items-center gap-1.5 text-slate-500 hover:text-yellow-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Commissions</span>
                            </Link>

                            <Link to="/orders" className="hidden lg:flex items-center gap-1.5 text-slate-500 hover:text-yellow-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Orders</span>
                            </Link>

                            <Link to="/wishlist" className="hidden lg:flex items-center gap-1.5 text-slate-500 hover:text-yellow-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Wishlist</span>
                            </Link>
                            
                            <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-slate-200">
                                <AvatarDropdown />
                                <span className="hidden md:block text-sm font-bold text-slate-700">
                                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link 
                                to="/login" 
                                className="text-xs font-bold uppercase tracking-widest px-4 py-2 text-slate-600 hover:text-black transition-colors"
                            >
                                Log in
                            </Link>
                            <Link 
                                to="/register" 
                                className="text-xs font-bold uppercase tracking-widest px-5 py-2.5 bg-black text-white rounded-lg hover:bg-slate-800 transition-all"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
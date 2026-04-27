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
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm shadow-yellow-200">
                            <span className="text-black text-xs font-black">S</span>
                        </div>
                        <div className="text-xl font-black tracking-tighter text-slate-900">
                            STELL<span className="text-yellow-500">ART</span>
                        </div>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/explore" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Explore</Link>
                    <Link to="/commissions" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Commissions</Link>
                    <Link to="/find-artists" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Find Artists</Link>
                    <Link to="/contact" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors">Support</Link>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/wishlist" className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-yellow-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Wishlist</span>
                            </Link>
                            <div className="pl-4 border-l border-slate-100 flex items-center gap-3">
                                <AvatarDropdown />
                                <span className="hidden md:block text-sm font-bold text-slate-700">
                                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                                </span>
                            </div>
                        </>
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
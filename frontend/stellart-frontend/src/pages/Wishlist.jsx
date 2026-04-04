import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getWishlist, removeFromWishlist } from "../service/apiService";

export default function Wishlist() {
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchWishlist() {
            const loggedUser = await getLoggedUser();
            if (!loggedUser) { navigate("/login"); return; }
            setUser(loggedUser);
            const data = await getWishlist(loggedUser.id);
            setArtworks(data || []);
            setIsLoading(false);
        }
        fetchWishlist();
    }, [navigate]);

    const handleRemove = async (artworkId) => {
        try {
            await removeFromWishlist(user.id, artworkId);
            setArtworks(prev => prev.filter(a => a.id !== artworkId));
            toast.success("Removed from wishlist");
        } catch { toast.error("Failed to remove"); }
    };

    const totalValue = artworks.reduce((sum, a) => sum + (a.price || 0), 0);
    const uniqueArtists = new Set(artworks.map(a => a.artist_id)).size;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-10">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">My Wishlist</h1>
                </div>
                <div className="h-1 flex-1 bg-slate-100 rounded-full" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{artworks.length} saved</span>
            </div>

            {/* CTA Banner */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl overflow-hidden mb-10">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-8 w-20 h-20 border-2 border-yellow-400 rounded-xl rotate-12" />
                    <div className="absolute top-6 right-16 w-14 h-14 border-2 border-sky-400 rounded-full" />
                    <div className="absolute bottom-4 left-1/3 w-16 h-16 border-2 border-violet-400 rounded-lg -rotate-6" />
                    <div className="absolute bottom-6 right-1/4 w-10 h-10 border-2 border-emerald-400 rounded-full" />
                </div>
                <div className="relative flex flex-col md:flex-row items-center gap-6 px-8 py-10">
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20 rotate-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-black text-white mb-1">Start building your collection</h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                            Bookmark the pieces that inspire you while exploring. They'll be waiting here whenever you come back.
                        </p>
                    </div>
                    <Link
                        to="/explore"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:brightness-110 hover:translate-y-[-2px] transition-all duration-300 shadow-lg shadow-yellow-500/20 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        Explore artworks
                    </Link>
                </div>
            </div>

            {/* Main content: sidebar + grid */}
            <div className="flex gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:flex flex-col gap-6 w-64 shrink-0">
                    {/* Quick stats */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overview</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Saved items", value: String(artworks.length), icon: "M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z", color: "text-yellow-500" },
                                { label: "Total value", value: `$${totalValue}`, icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "text-emerald-500" },
                                { label: "Artists", value: String(uniqueArtists), icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z", color: "text-sky-500" },
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                        <p className="text-sm font-black text-slate-800">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filter by type */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Product Type</h3>
                        <div className="space-y-2">
                            {["All", "Digital Art", "Print", "Canvas"].map((type, i) => (
                                <button
                                    key={type}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                                        i === 0
                                            ? "bg-yellow-50 text-yellow-700 font-bold"
                                            : "text-slate-500 hover:bg-slate-50 font-medium"
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter by tags */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {["Fantasy", "Sci-Fi", "Illustration", "Cyberpunk", "Landscape", "Portrait", "3D", "Street Art", "Nature", "Dark", "Warm"].map(tag => (
                                <span key={tag} className="text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-yellow-50 hover:text-yellow-700 px-2.5 py-1 rounded-full cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How it works</h3>
                        <div className="space-y-3">
                            {[
                                { step: "1", text: "Explore the gallery", color: "bg-yellow-50 text-yellow-600" },
                                { step: "2", text: "Bookmark what you love", color: "bg-sky-50 text-sky-600" },
                                { step: "3", text: "Revisit anytime", color: "bg-violet-50 text-violet-600" },
                            ].map(s => (
                                <div key={s.step} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${s.color}`}>{s.step}</div>
                                    <p className="text-xs text-slate-500 font-medium">{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Artwork grid */}
                <div className="flex-1">
                    {artworks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">No saved artworks yet</h2>
                            <p className="text-slate-400 text-sm max-w-sm">Explore the gallery and bookmark the pieces that inspire you.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            {artworks.map((art) => (
                                <div key={art.id} className="group">
                                    <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                        <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(art.id)}
                                            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        {/* Product type badge */}
                                        {art.product_type && (
                                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                                                {art.product_type}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 px-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-800 truncate">{art.title}</h3>
                                            {art.price != null && <span className="text-sm font-black text-yellow-600">${art.price}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                                </svg>
                                                {art.likes_count}
                                            </span>
                                            {art.tags?.map(tag => (
                                                <span key={tag} className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

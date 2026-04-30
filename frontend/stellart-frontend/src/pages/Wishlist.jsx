import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getWishlist, removeFromWishlist, getProfile, reportArtwork, likeArtwork, unlikeArtwork } from "../service/apiService";
import PaymentModal from "../components/PaymentModal";

export default function Wishlist() {
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [artistNames, setArtistNames] = useState({});
    const [likedIds, setLikedIds] = useState(new Set());
    const [localLikes, setLocalLikes] = useState({});
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [filterType, setFilterType] = useState('All');
    const [filterTag, setFilterTag] = useState(null);

    useEffect(() => {
        async function fetchWishlist() {
            const loggedUser = await getLoggedUser();
            if (!loggedUser) { navigate("/login"); return; }
            setUser(loggedUser);
            const data = await getWishlist(loggedUser.id);
            setArtworks(data || []);

            const userLikes = JSON.parse(localStorage.getItem(`stellart_likes_${loggedUser.id}`) || '[]');
            setLikedIds(new Set(userLikes));

            setIsLoading(false);
        }
        fetchWishlist();
    }, [navigate]);

    useEffect(() => {
        const fetchArtistNames = async () => {
            if (artworks.length === 0) return;
            const uniqueArtistIds = [...new Set(artworks.map(art => art.artist_id).filter(Boolean))];
            const newNames = { ...artistNames };
            let updated = false;

            for (const id of uniqueArtistIds) {
                if (!newNames[id]) {
                    try {
                        const profile = await getProfile(id);
                        if (profile) {
                            newNames[id] = profile.full_name || profile.name || profile.username || "Unknown Artist";
                            updated = true;
                        }
                    } catch {
                        newNames[id] = "Unknown Artist";
                        updated = true;
                    }
                }
            }
            if (updated) setArtistNames(newNames);
        };
        fetchArtistNames();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [artworks]);

    const handleRemove = async (e, artworkId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;
        try {
            await removeFromWishlist(user.id, artworkId);
            setArtworks(prev => prev.filter(a => a.id !== artworkId));
            toast.success("Removed from wishlist");
        } catch { toast.error("Failed to remove"); }
    };

    const toggleLike = async (e, artworkId, currentLikes = 0) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { toast.error('Log in to like artworks'); return; }
        const isLiked = likedIds.has(artworkId);
        const newLiked = new Set(likedIds);
        let newCount = currentLikes;

        if (isLiked) {
            newLiked.delete(artworkId);
            newCount = Math.max(0, currentLikes - 1);
            setLikedIds(newLiked);
            localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            try { await unlikeArtwork(artworkId, user.id); } catch { toast.error('Error unliking'); }
        } else {
            newLiked.add(artworkId);
            newCount = currentLikes + 1;
            setLikedIds(newLiked);
            localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            try {
                await likeArtwork(artworkId, user.id);
                toast.success('Artwork liked');
            } catch { toast.error('Error liking'); }
        }
    };

    const handleReportSubmit = async () => {
        if (!user || !reportReason) return;
        setIsSubmittingReport(true);
        try {
            await reportArtwork(selectedArtwork.id, user.id, reportReason);
            toast.success('Report sent successfully');
            setIsReportModalOpen(false);
            setReportReason("");
        } catch {
            toast.error('Failed to report');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handlePaymentSuccess = () => {
        toast.success('Purchase completed!');
        setShowPaymentModal(false);
    };

    // Dynamic product types from actual artworks
    const dynamicTypes = ['All', ...new Set(artworks.map(a => a.product_type).filter(Boolean))];

    // Dynamic tags from actual artworks
    const allTags = [...new Set(artworks.flatMap(a => a.tags || []))];

    // Filter artworks
    const filteredArtworks = artworks.filter(art => {
        const matchesType = filterType === 'All' || art.product_type === filterType;
        const matchesTag = !filterTag || (art.tags || []).includes(filterTag);
        return matchesType && matchesTag;
    });

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
                                { label: "Total value", value: `$${totalValue.toFixed(2)}`, icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", color: "text-emerald-500" },
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
                            {dynamicTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                                        filterType === type
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
                    {allTags.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                                            filterTag === tag
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "text-slate-500 bg-slate-50 hover:bg-yellow-50 hover:text-yellow-700"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

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
                    {filteredArtworks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">No saved artworks yet</h2>
                            <p className="text-slate-400 text-sm max-w-sm">Explore the gallery and bookmark the pieces that inspire you.</p>
                            <Link to="/explore" className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md">
                                Explore Gallery
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            {filteredArtworks.map((art) => {
                                const currentLikes = localLikes[art.id] !== undefined ? localLikes[art.id] : (art.likes_count || 0);
                                return (
                                    <div key={art.id} className="group">
                                        <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <Link to={`/artwork-details/${art.id}`}>
                                                <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </Link>
                                            {/* Remove button */}
                                            <button
                                                onClick={(e) => handleRemove(e, art.id)}
                                                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {/* Like button */}
                                            <button
                                                onClick={(e) => toggleLike(e, art.id, currentLikes)}
                                                className={`absolute top-3 left-12 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-opacity ${likedIds.has(art.id) ? 'text-red-500 opacity-0 group-hover:opacity-100' : 'text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likedIds.has(art.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            </button>
                                            {/* Report button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault(); e.stopPropagation();
                                                    setSelectedArtwork(art);
                                                    setIsReportModalOpen(true);
                                                }}
                                                className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                                </svg>
                                            </button>
                                            {/* Product type badge */}
                                            {art.product_type && (
                                                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                                                    {art.product_type}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-2 px-1">
                                            <div className="flex items-center justify-between">
                                                <Link to={`/artwork-details/${art.id}`}>
                                                    <h3 className="text-sm font-bold text-slate-800 truncate hover:text-yellow-500 transition-colors">{art.title}</h3>
                                                </Link>
                                                {art.price != null && <span className="text-sm font-black text-yellow-600">${art.price.toFixed(2)}</span>}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                                                <Link to={`/profile/${art.artist_id}`} className="hover:text-yellow-500 transition-colors">
                                                    {artistNames[art.artist_id] || "Loading..."}
                                                </Link>
                                            </p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                                    </svg>
                                                    {currentLikes}
                                                </span>
                                                {art.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Purchase / Not for sale */}
                                        <div className="px-1 mt-2">
                                            {(art.on_sale || art.price) ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault(); e.stopPropagation();
                                                        setSelectedArtwork(art);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="w-full py-2 bg-yellow-400 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                                >
                                                    Purchase Now
                                                </button>
                                            ) : (
                                                <div className="w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                                                    Not for sale
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Artwork</h3>
                        <p className="text-sm text-slate-500 mb-6">Why are you reporting this artwork?</p>
                        <select
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-3 mb-6 text-slate-700 outline-none focus:border-yellow-400 bg-white"
                        >
                            <option value="" disabled>Select a reason...</option>
                            <option value="NSFW / Inappropriate Content">NSFW / Inappropriate Content</option>
                            <option value="Copyright Violation / Stolen Art">Copyright Violation / Stolen Art</option>
                            <option value="Spam / Misleading">Spam / Misleading</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setIsReportModalOpen(false); setReportReason(""); }}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                disabled={isSubmittingReport || !reportReason}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isSubmittingReport ? 'Sending...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                item={selectedArtwork}
                amount={selectedArtwork?.price || 0}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

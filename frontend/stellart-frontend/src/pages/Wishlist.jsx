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
    }, [artworks, artistNames]);

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

    const productTypes = ['All', 'Digital', 'Physical', 'Print', 'Canvas', 'Photography', 'Standard', 'Concept Art'];
    const dynamicTypes = [...new Set([...productTypes, ...artworks.map(a => a.product_type).filter(Boolean)])];

    const filteredArtworks = artworks.filter(art => filterType === 'All' || art.product_type === filterType);

    const totalValue = artworks.reduce((sum, a) => sum + (a.price || 0), 0);
    const uniqueArtists = new Set(artworks.map(a => a.artist_id)).size;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
                        <p className="text-slate-500 font-medium mt-1">
                            You have saved {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-yellow-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Value</p>
                                <p className="text-lg font-black text-slate-900">${totalValue.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Artists</p>
                                <p className="text-lg font-black text-slate-900">{uniqueArtists}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <div className="flex items-center gap-2 px-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</span>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            {dynamicTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {filteredArtworks.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Nothing found</h2>
                        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                            Try changing the filter or go to Explore to discover and save artworks that catch your eye.
                        </p>
                        <Link to="/explore" className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95">
                            Explore Gallery
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredArtworks.map(art => {
                            const currentLikes = localLikes[art.id] !== undefined ? localLikes[art.id] : (art.likes_count || 0);
                            return (
                                <article 
                                    key={art.id} 
                                    className="group rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white p-3 border border-slate-100 shadow-sm hover:shadow-md"
                                >
                                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 shadow-sm relative">
                                        <Link to={`/artwork-details/${art.id}`}>
                                            <img 
                                                src={art.image_url} 
                                                alt={art.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />
                                        </Link>
                                    </div>
                                    <div className="flex justify-between items-start px-1">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <Link to={`/artwork-details/${art.id}`}>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight truncate hover:text-yellow-500 transition-colors">
                                                    {art.title}
                                                </h3>
                                            </Link>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                                                {artistNames[art.artist_id] || "Loading..."} <span className="text-slate-300 mx-1">•</span> <span className="text-yellow-600">{art.product_type}</span>
                                            </p>
                                            {art.price && (
                                                <p className="text-yellow-600 font-bold text-sm mt-1">${art.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={(e) => handleRemove(e, art.id)}
                                                className="transition-colors text-yellow-500 hover:text-slate-300"
                                                title="Remove from wishlist"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => toggleLike(e, art.id, currentLikes)}
                                                className={`transition-colors ${likedIds.has(art.id) ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
                                                title="Like Artwork"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likedIds.has(art.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    setSelectedArtwork(art); 
                                                    setIsReportModalOpen(true); 
                                                }}
                                                className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                                                title="Report Artwork"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-1 pb-1">
                                        {(art.on_sale || art.price) ? (
                                            <button 
                                                onClick={(e) => { 
                                                    e.preventDefault();
                                                    e.stopPropagation(); 
                                                    setSelectedArtwork(art); 
                                                    setShowPaymentModal(true); 
                                                }}
                                                className="w-full mt-3 py-2.5 bg-yellow-400 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                            >
                                                Purchase Now
                                            </button>
                                        ) : (
                                            <div className="w-full mt-3 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                                                Not for sale
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {isReportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Artwork</h3>
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
                                onClick={() => {
                                    setIsReportModalOpen(false);
                                    setReportReason("");
                                }}
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
                onSuccess={() => { toast.success('Purchase completed!'); setShowPaymentModal(false); }}
            />
        </main>
    );
}
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getArtwork, getProfile, likeArtwork, unlikeArtwork, getLoggedUser, addToWishlist, removeFromWishlist, getWishlist, reportArtwork } from "../service/apiService";
import { toast } from "sonner";
import PaymentModal from "../components/PaymentModal";

export default function ArtworkDetails() {
    const { id } = useParams();
    const [artwork, setArtwork] = useState(null);
    const [artist, setArtist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const loggedUser = await getLoggedUser();
                setUser(loggedUser);

                const data = await getArtwork(id);
                setArtwork(data);
                setLikesCount(data.likes_count || 0);

                if (data.artist_id) {
                    const artistData = await getProfile(data.artist_id);
                    setArtist(artistData);
                }

                if (loggedUser) {
                    const userLikes = JSON.parse(localStorage.getItem(`stellart_likes_${loggedUser.id}`) || '[]');
                    setIsLiked(userLikes.includes(id));

                    const wishlist = await getWishlist(loggedUser.id);
                    setIsSaved((wishlist || []).some(item => item.id === id));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [id]);

    const handleLike = async () => {
        if (!user) { toast.error("Log in to like artworks"); return; }
        
        try {
            const currentLikes = JSON.parse(localStorage.getItem(`stellart_likes_${user.id}`) || '[]');
            
            if (isLiked) {
                await unlikeArtwork(id, user.id);
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
                localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify(currentLikes.filter(likeId => likeId !== id)));
            } else {
                await likeArtwork(id, user.id);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
                localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify([...currentLikes, id]));
                toast.success("Artwork liked!");
            }
        } catch {
            toast.error("Failed to update like status");
        }
    };

    const handleSave = async () => {
        if (!user) { toast.error("Log in to save artworks"); return; }

        try {
            if (isSaved) {
                await removeFromWishlist(user.id, id);
                setIsSaved(false);
                toast.success("Removed from wishlist");
            } else {
                await addToWishlist(user.id, id);
                setIsSaved(true);
                toast.success("Saved to wishlist!");
            }
        } catch {
            toast.error("Failed to update wishlist");
        }
    };

    const handleReportSubmit = async () => {
        if (!user || !reportReason) return;
        setIsSubmittingReport(true);
        try {
            await reportArtwork(id, user.id, reportReason);
            toast.success("Report sent successfully");
            setIsReportModalOpen(false);
            setReportReason("");
        } catch {
            toast.error("Failed to report artwork");
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleFullscreenRequest = (e) => {
        e.stopPropagation();
        const elem = document.getElementById("expanded-artwork-detail");
        if (elem?.requestFullscreen) {
            elem.requestFullscreen();
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div></div>;
    if (!artwork) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Artwork not found</div>;

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 mb-8 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Explore
                </Link>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
                    
                    <div className="w-full lg:w-1/2 bg-slate-100 p-8 flex items-center justify-center group cursor-pointer" onClick={() => setIsFullscreen(true)}>
                        <div className="relative rounded-2xl overflow-hidden shadow-md max-w-lg w-full">
                            <img src={artwork.image_url} alt={artwork.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col relative">
                        <div className="absolute top-8 right-8 flex items-center gap-3">
                            <button onClick={handleLike} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 shadow-sm'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </button>
                            <button onClick={handleSave} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isSaved ? 'bg-yellow-400 border-yellow-500 text-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-yellow-200 hover:text-yellow-600 hover:bg-yellow-50 shadow-sm'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg>
                            </button>
                            <button onClick={() => setIsReportModalOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center border bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all" title="Report">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </button>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight pr-40 mb-2">{artwork.title}</h1>
                        
                        {artwork.price && (
                            <p className="text-3xl font-black text-yellow-500 mb-8">${artwork.price.toFixed(2)}</p>
                        )}

                        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
                            <Link to={`/profile/${artist?.id}`} className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 hover:border-yellow-400 transition-colors shadow-sm bg-slate-50 flex items-center justify-center shrink-0">
                                {artist?.avatar_url ? (
                                    <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-black text-slate-300 uppercase">{(artist?.full_name || "U")[0]}</span>
                                )}
                            </Link>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Created by</p>
                                <Link to={`/profile/${artist?.id}`} className="text-lg font-bold text-slate-900 hover:text-yellow-500 transition-colors">
                                    {artist?.full_name || "Unknown Artist"}
                                </Link>
                            </div>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-3">About this piece</h3>
                        <p className="text-slate-600 leading-relaxed mb-8">{artwork.description || "No description provided."}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Product Type</p>
                                <p className="font-bold text-slate-900">{artwork.product_type || "Standard"}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Likes</p>
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                                </div>
                            </div>
                        </div>

                        {artwork.tags && artwork.tags.length > 0 && (
                            <div className="mb-10">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {artwork.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6">
                            {(artwork.price || artwork.on_sale) ? (
                                <button onClick={() => setShowPaymentModal(true)} className="w-full py-4 bg-yellow-400 text-slate-900 font-black text-lg rounded-xl shadow-sm hover:bg-yellow-300 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Purchase Artwork
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-slate-100 text-slate-400 font-black text-lg rounded-xl text-center uppercase tracking-widest border border-slate-200">
                                    Not For Sale
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isFullscreen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8" onClick={() => setIsFullscreen(false)}>
                    <button onClick={() => setIsFullscreen(false)} className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <button onClick={handleFullscreenRequest} className="absolute top-6 right-24 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10" title="Native Fullscreen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>

                    <img 
                        id="expanded-artwork-detail"
                        src={artwork.image_url} 
                        alt={artwork.title} 
                        className="max-w-full max-h-full object-contain shadow-2xl" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

            {isReportModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Artwork</h3>
                        <p className="text-sm text-slate-500 mb-4">Please select a reason for reporting this piece.</p>
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
                item={artwork} 
                amount={artwork?.price || 0} 
                onSuccess={() => { toast.success("Purchase completed!"); setShowPaymentModal(false); }} 
            />
        </main>
    );
}
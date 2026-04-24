import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getProfile, getLoggedUser, getWishlist, addToWishlist, removeFromWishlist, reportArtwork, likeArtwork, unlikeArtwork } from '../service/apiService';
import PaymentModal from '../components/PaymentModal'; 

const ArtworkDetails = () => {
    const { id } = useParams(); 
    const [user, setUser] = useState(null);
    const [artwork, setArtwork] = useState(null);
    const [artistProfile, setArtistProfile] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    useEffect(() => {
        const loadArtworkData = async () => {
        try {
            setLoading(true);
            const loggedUser = await getLoggedUser();
            setUser(loggedUser);

            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const res = await fetch(`${BACKEND_URL}/artworks/${id}`);
            
            if (!res.ok) {
                throw new Error("Artwork not found");
            }
            const artData = await res.json();
            setArtwork(artData);
            setLikesCount(artData.likes_count || 0);

            if (artData.artist_id) {
                const profile = await getProfile(artData.artist_id);
                setArtistProfile(profile);
            }

            if (loggedUser) {
                const wishlist = await getWishlist(loggedUser.id);
                setIsWishlisted((wishlist || []).some(item => item.id === id));
            }

            const localLikes = JSON.parse(localStorage.getItem('stellart_likes') || '[]');
            setIsLiked(localLikes.includes(id));

            setError(null);
        } catch (err) {
            setError('Failed to load artwork details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
        if (id) {
            loadArtworkData();
        }
    }, [id]);

    const toggleWishlist = async () => {
        if (!user) { toast.error('Log in to save artworks'); return; }
        try {
            if (isWishlisted) {
                await removeFromWishlist(user.id, artwork.id);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(user.id, artwork.id);
                setIsWishlisted(true);
                toast.success('Added to wishlist');
            }
        } catch { toast.error('Wishlist update failed'); }
    };

    const toggleLike = async () => {
        const newLikedStatus = !isLiked;
        const newCount = newLikedStatus ? likesCount + 1 : Math.max(0, likesCount - 1);
        
        setIsLiked(newLikedStatus);
        setLikesCount(newCount);
        
        const storedLikes = new Set(JSON.parse(localStorage.getItem('stellart_likes') || '[]'));
        if (newLikedStatus) {
            storedLikes.add(artwork.id);
        } else {
            storedLikes.delete(artwork.id);
        }
        localStorage.setItem('stellart_likes', JSON.stringify([...storedLikes]));

        try {
            if (newLikedStatus) {
                await likeArtwork(artwork.id);
                toast.success('Artwork liked');
            } else {
                await unlikeArtwork(artwork.id);
            }
        } catch {
            setIsLiked(!newLikedStatus);
            setLikesCount(likesCount);
            toast.error('Action failed');
        }
    };

    const handleReportSubmit = async () => {
        if (!user) {
            toast.error('Log in to report artworks');
            return;
        }
        if (!reportReason) {
            toast.error('Please select a reason');
            return;
        }
        
        setIsSubmittingReport(true);
        try {
            await reportArtwork(artwork.id, user.id, reportReason);
            toast.success('Report sent successfully');
            setIsReportModalOpen(false);
            setReportReason("");
        } catch {
            toast.error('Failed to send report');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handlePaymentSuccess = () => {
        toast.success('Purchase completed!');
        setShowPaymentModal(false);
    };

    if (loading) {
        return (
        <div className="min-h-[70vh] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-yellow-400 animate-spin" />
        </div>
        );
    }

    if (error || !artwork) {
        return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
            <div className="bg-red-50 text-red-500 font-bold px-6 py-4 rounded-2xl border border-red-100">
            Oops! {error || "Artwork not found"}
            </div>
            <Link to="/explore" className="text-slate-500 hover:text-yellow-500 font-bold underline">
                Return to Gallery
            </Link>
        </div>
        );
    }

    const artistNameDisplay = artistProfile?.full_name || artistProfile?.name || artistProfile?.username || "Unknown Artist";
    const artistAvatar = artistProfile?.avatar_url || null;
    const isForSale = artwork.price !== null && artwork.price > 0;

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                <div className="lg:w-1/2 w-full lg:sticky lg:top-12 self-start">
                    <div className="bg-slate-50 p-4 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm group overflow-hidden flex items-center justify-center min-h-[500px] relative">
                    <img 
                        src={artwork.image_url} 
                        alt={artwork.title} 
                        className="rounded-2xl max-h-[75vh] object-contain shadow-lg transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                    </div>
                </div>

            <div className="lg:w-1/2 w-full flex flex-col py-4">
                
                <div className="mb-6 flex justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2 leading-tight">
                            {artwork.title}
                        </h1>
                        {isForSale ? (
                            <div className="text-4xl font-black text-yellow-500">
                                ${artwork.price.toFixed(2)}
                            </div>
                        ) : (
                            <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg font-bold uppercase tracking-widest text-sm">
                                Not for sale
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={toggleLike}
                            className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isLiked ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'}`}
                            title="Like Artwork"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>
                        <button 
                            onClick={toggleWishlist}
                            className={`cursor-pointer w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isWishlisted ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' : 'bg-white border border-slate-200 text-slate-400 hover:text-yellow-500 hover:border-yellow-200'}`}
                            title="Save to Wishlist"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setIsReportModalOpen(true)}
                            className="cursor-pointer w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                            title="Report Artwork"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                    {artistAvatar ? (
                        <img 
                            src={artistAvatar} 
                            alt={artistNameDisplay}
                            className="w-14 h-14 rounded-full border-2 border-yellow-400 shadow-sm object-cover bg-slate-100"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full border-2 border-yellow-400 shadow-sm bg-slate-100 flex items-center justify-center text-xl font-black text-yellow-500 uppercase">
                            {artistNameDisplay.charAt(0)}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        Created by
                        </span>
                        <Link to={`/profile/${artwork.artist_id}`} className="text-lg font-bold text-slate-900 hover:text-yellow-500 transition-colors">
                        {artistNameDisplay}
                        </Link>
                    </div>
                </div>

                {/* Descripción */}
                <div className="mb-10">
                    <h3 className="text-lg font-black text-slate-900 mb-3">About this piece</h3>
                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                        {artwork.description || "The artist hasn't provided a description for this artwork yet."}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Type</p>
                        <p className="text-slate-900 font-bold">{artwork.product_type || "Standard"}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Likes</p>
                        <p className="text-slate-900 font-bold flex items-center gap-1.5">
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </p>
                    </div>
                </div>

                {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                    {artwork.tags.map((tag, index) => (
                        <span key={index} className="px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-bold border border-yellow-200">
                        {tag}
                        </span>
                    ))}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                {isForSale && (
                    <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="cursor-pointer flex-1 bg-yellow-400 text-slate-900 font-black py-4 px-6 rounded-2xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Purchase Artwork
                    </button>
                )}
                </div>

            </div>
            </div>
        </div>

        <PaymentModal 
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            item={artwork}
            amount={artwork?.price || 0}
            onSuccess={handlePaymentSuccess}
        />

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
                            onClick={() => {
                                setIsReportModalOpen(false);
                                setReportReason("");
                            }}
                            className="cursoir-pointer flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReportSubmit}
                            disabled={isSubmittingReport || !reportReason}
                            className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            {isSubmittingReport ? 'Sending...' : 'Submit Report'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ArtworkDetails;
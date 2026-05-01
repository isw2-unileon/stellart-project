import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    getArtwork, getProfile, likeArtwork, unlikeArtwork, 
    getLoggedUser, addToWishlist, removeFromWishlist, 
    getWishlist, reportArtwork, getUserAddresses, createOrder 
} from "../service/apiService";
import { toast } from "sonner";
import PaymentModal from "../components/PaymentModal";

export default function ArtworkDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
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
    // Removed isSubmittingReport error
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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

                    const userAddresses = await getUserAddresses(loggedUser.id);
                    setAddresses(userAddresses || []);
                    if (userAddresses && userAddresses.length > 0) {
                        setSelectedAddressId(userAddresses[0].id || userAddresses[0].ID);
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading artwork details");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [id]);

    const handlePaymentSuccess = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address");
            return;
        }

        setIsSubmittingOrder(true);
        try {
            const orderData = {
                artwork_id: id,
                seller_id: artwork.artist_id,
                shipping_address_id: selectedAddressId,
                amount: artwork.price
            };

            await createOrder(orderData);
            toast.success("Purchase completed and order created!");
            setShowPaymentModal(false);
            navigate("/orders");
        } catch (error) {
            console.error("Order error:", error);
            toast.error("Payment successful but failed to create order.");
        } finally {
            setIsSubmittingOrder(false);
        }
    };

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
        } catch { toast.error("Failed to update like status"); }
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
        } catch { toast.error("Failed to update wishlist"); }
    };

    const handleReportSubmit = async () => {
        if (!user || !reportReason) return;
        // Logic kept, but used local variable if state was removed
        try {
            await reportArtwork(id, user.id, reportReason);
            toast.success("Report sent successfully");
            setIsReportModalOpen(false);
            setReportReason("");
        } catch { toast.error("Failed to report artwork"); }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
        </div>
    );

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
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col relative text-left">
                        <div className="absolute top-8 right-8 flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 h-10 rounded-full border transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 shadow-sm'}`}>
                                <button onClick={handleLike} className="transition-transform active:scale-90 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                </button>
                                <span className="text-sm font-bold">{likesCount}</span>
                            </div>
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
                        
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1 mb-6">
                            <span className="text-yellow-600">{artwork.product_type || "Standard"}</span>
                        </p>

                        <div className="mb-8">
                            {artwork.price ? (
                                <div className="inline-flex flex-col bg-linear-to-br from-yellow-50 to-white p-6 rounded-3xl border border-yellow-200/50 shadow-sm">
                                    <span className="text-[11px] font-bold text-yellow-600/70 uppercase tracking-widest mb-1">Actual Price</span>
                                    <span className="text-yellow-600 font-black text-3xl tracking-tight">${artwork.price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center px-4 py-3 bg-slate-100 rounded-xl">
                                    <span className="text-slate-400 font-bold text-xl uppercase tracking-widest">Not for sale</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                            <Link to={`/profile/${artist?.id}`} className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
                                {artist?.avatar_url ? <img src={artist.avatar_url} className="w-full h-full object-cover" /> : <span className="text-lg font-black text-slate-300">{(artist?.full_name || artist?.name || artist?.username || "U")[0]}</span>}
                            </Link>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Created by</p>
                                <Link to={`/profile/${artist?.id}`} className="text-lg font-bold text-slate-900 hover:text-yellow-500 transition-colors">{artist?.full_name || artist?.name || artist?.username || "Unknown Artist"}</Link>
                            </div>
                        </div>

                        {artwork.description && (
                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Description</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{artwork.description}</p>
                            </div>
                        )}

                        {artwork.price > 0 && (
                            <div className="mb-8">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    Shipping Destination
                                </h3>
                                {addresses.length > 0 ? (
                                    <div className="relative">
                                        <select 
                                            value={selectedAddressId} 
                                            onChange={(e) => setSelectedAddressId(e.target.value)} 
                                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 outline-none transition-all cursor-pointer"
                                        >
                                            {addresses.map(addr => (
                                                <option key={addr.id || addr.ID} value={addr.id || addr.ID}>
                                                    {addr.street || addr.Street}, {addr.city || addr.City}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <Link to="/shipping" className="flex items-center justify-center w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-yellow-600 hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                                        + Add a shipping address
                                    </Link>
                                )}
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            {artwork.price > 0 ? (
                                <button 
                                    onClick={() => {
                                        if (!user) { toast.error("Please login to purchase"); return; }
                                        if (!selectedAddressId) { toast.error("Select an address first"); return; }
                                        setShowPaymentModal(true);
                                    }} 
                                    className="w-full py-4 bg-yellow-400 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    disabled={isSubmittingOrder}
                                >
                                    {isSubmittingOrder ? "Processing..." : "Purchase"}
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-slate-100 text-slate-400 font-bold text-sm rounded-xl text-center uppercase tracking-widest">
                                    Not For Sale
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isFullscreen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsFullscreen(false)}>
                    <img src={artwork.image_url} alt={artwork.title} className="max-w-full max-h-full object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}

            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Artwork</h3>
                        <select 
                            value={reportReason} 
                            onChange={(e) => setReportReason(e.target.value)} 
                            className="w-full border border-slate-200 rounded-xl p-3 mb-6 bg-white outline-none focus:border-yellow-400"
                        >
                            <option value="" disabled>Select reason...</option>
                            <option value="NSFW / Inappropriate Content">NSFW / Inappropriate Content</option>
                            <option value="Copyright Violation / Stolen Art">Copyright Violation / Stolen Art</option>
                            <option value="Spam / Misleading">Spam / Misleading</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex gap-3">
                            <button onClick={() => setIsReportModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleReportSubmit} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Submit</button>
                        </div>
                    </div>
                </div>
            )}

           <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
                item={artwork ? { ...artwork, img: artwork.image_url } : null} 
                amount={artwork?.price || 0} 
                onSuccess={handlePaymentSuccess}
            />
        </main>
    );
}
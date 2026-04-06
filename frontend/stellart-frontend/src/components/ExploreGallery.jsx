import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import { getProfile, getLoggedUser, getWishlist, addToWishlist, removeFromWishlist, reportArtwork, likeArtwork, unlikeArtwork, getTrendingArtworks } from '../service/apiService';

export default function ExploreGallery({ artworks = [] }) {
    
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [artistNames, setArtistNames] = useState({});
    const [user, setUser] = useState(null);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    const [trendingData, setTrendingData] = useState([]);
    const [likedIds, setLikedIds] = useState(() => new Set(JSON.parse(localStorage.getItem('stellart_likes') || '[]')));
    const [localLikes, setLocalLikes] = useState({});

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const placeholderArtworks = [
        { id: 'p1', title: "Neon City", artist: "@cyber_artist", productType: "Digital", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p2', title: "Abstract Mind", artist: "@creative_soul", productType: "Canvas", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p3', title: "Forest Guardian", artist: "@nature_art", productType: "Print", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p4', title: "Space Odyssey", artist: "@star_gazer", productType: "Digital", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2059&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p5', title: "Digital Samurai", artist: "@blade_runner", productType: "Digital", img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p6', title: "Urban Decay", artist: "@street_vision", productType: "Photography", img: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2070&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p7', title: "Solar Flare", artist: "@astro_painter", productType: "Canvas", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1974&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p8', title: "Lost Temple", artist: "@mythos_art", productType: "Concept Art", img: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?q=80&w=2070&auto=format&fit=crop", isPlaceholder: true },
        { id: 'p9', title: "Crystal Cave", artist: "@gem_creator", productType: "Digital", img: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=2080&auto=format&fit=crop", isPlaceholder: true },
    ];

    useEffect(() => {
        async function loadInitialData() {
            const loggedUser = await getLoggedUser();
            if (loggedUser) {
                setUser(loggedUser);
                const items = await getWishlist(loggedUser.id);
                setWishlistIds(new Set((items || []).map(a => a.id)));
            }

            if (!artworks || artworks.length === 0) {
                setIsLoadingTrending(true);
                const trending = await getTrendingArtworks();
                setTrendingData(trending || []);
                setIsLoadingTrending(false);
            }
        }
        loadInitialData();
    }, [artworks]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
                setIsReportModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleWishlist = async (e, artworkId) => {
        e.stopPropagation();
        if (!user) { toast.error('Log in to save artworks'); return; }
        try {
            if (wishlistIds.has(artworkId)) {
                await removeFromWishlist(user.id, artworkId);
                setWishlistIds(prev => { const next = new Set(prev); next.delete(artworkId); return next; });
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(user.id, artworkId);
                setWishlistIds(prev => new Set(prev).add(artworkId));
                toast.success('Added to wishlist');
            }
        } catch { toast.error('Wishlist update failed'); }
    };

    const toggleLike = async (e, artworkId, currentLikes = 0) => {
        e.stopPropagation();
        const isLiked = likedIds.has(artworkId);
        const newLiked = new Set(likedIds);
        let newCount = currentLikes;

        if (isLiked) {
            newLiked.delete(artworkId);
            newCount = Math.max(0, currentLikes - 1);
            setLikedIds(newLiked);
            localStorage.setItem('stellart_likes', JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            if (selectedArtwork && selectedArtwork.id === artworkId) {
                setSelectedArtwork(prev => ({ ...prev, likes_count: newCount }));
            }
            try {
                await unlikeArtwork(artworkId);
            } catch {
                toast.error('Failed to remove like');
            }
        } else {
            newLiked.add(artworkId);
            newCount = currentLikes + 1;
            setLikedIds(newLiked);
            localStorage.setItem('stellart_likes', JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            if (selectedArtwork && selectedArtwork.id === artworkId) {
                setSelectedArtwork(prev => ({ ...prev, likes_count: newCount }));
            }
            try {
                await likeArtwork(artworkId);
                toast.success('Artwork liked');
            } catch {
                toast.error('Failed to send like');
            }
        }
    };

    const handleFullscreenRequest = (e) => {
        e.stopPropagation();
        const elem = document.getElementById("expanded-artwork");
        if (elem) {
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
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
            await reportArtwork(selectedArtwork.id, user.id, reportReason);
            toast.success('Report sent successfully');
            setIsReportModalOpen(false);
            setReportReason("");
        } catch {
            toast.error('Failed to send report');
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const isSearching = artworks && artworks.length > 0;
    const hasTrendingData = trendingData && trendingData.length > 0;

    let activeArtworks = [];
    let isRealData = false;

    if (isSearching) {
        activeArtworks = artworks;
        isRealData = true;
    } else if (hasTrendingData) {
        activeArtworks = trendingData;
        isRealData = true;
    } else {
        activeArtworks = placeholderArtworks;
        isRealData = false;
    }

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!isRealData || activeArtworks.length === 0) return;

            const uniqueArtistIds = [...new Set(activeArtworks.map(art => art.artist_id).filter(Boolean))];
            const newNames = { ...artistNames };
            let stateNeedsUpdate = false;

            for (const id of uniqueArtistIds) {
                if (!newNames[id]) {
                    try {
                        const profileData = await getProfile(id);
                        if (profileData) {
                            newNames[id] = profileData.full_name || profileData.name || profileData.username || "Unknown Artist";
                            stateNeedsUpdate = true;
                        }
                    } catch (error) {
                        console.error(`Error fetching profile for ${id}:`, error);
                        newNames[id] = "Unknown Artist";
                        stateNeedsUpdate = true;
                    }
                }
            }

            if (stateNeedsUpdate) {
                setArtistNames(newNames);
            }
        };

        fetchProfiles();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [activeArtworks, isRealData]);

    const displayArtworks = activeArtworks.map((art, index) => {
        if (art.isPlaceholder) {
            return {
                ...art,
                artist: art.artist,
                likes_count: 0,
                on_sale: false,
                price: null,
                description: "This is a placeholder artwork."
            };
        }

        const id = art.id || `art-${index}`;
        const baseLikes = art.likes_count || 0;
        const currentLikes = localLikes[id] !== undefined ? localLikes[id] : baseLikes;
        
        return {
            id,
            title: art.title || "Untitled Artwork",
            artist: artistNames[art.artist_id] || "Loading artist...",
            productType: art.product_type || "Standard", 
            img: art.image_url || "https://images.unsplash.com/photo-1561214115-f2f114ce1437?q=80&w=2000&auto=format&fit=crop", 
            description: art.description || "No description provided for this artwork.",
            price: art.price || null,
            likes_count: currentLikes,
            on_sale: art.on_sale || art.price != null,
            isPlaceholder: false
        };
    });

    const handlePaymentSuccess = () => {
        toast.success('Purchase completed!');
        setSelectedArtwork(null);
    };

    return (
        <section className="max-w-360 mx-auto px-6 py-24">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    {isSearching ? 'Search Results' : 'Trending Now'}
                </h2>
            </div>

            <div className="flex items-start gap-8 transition-all duration-500 ease-in-out relative">
                
                <div className={`transition-all duration-500 ease-in-out ${selectedArtwork ? 'w-full lg:w-[65%]' : 'w-full'}`}>
                    
                    {!isSearching && isLoadingTrending ? (
                        <div className={`grid gap-6 transition-all duration-500 ${selectedArtwork ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                            {[...Array(displayArtworks.length)].map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="aspect-square bg-slate-100 rounded-2xl mb-4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`grid gap-6 transition-all duration-500 ${selectedArtwork ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                            {displayArtworks.map((art) => (
                                <article 
                                    key={art.id} 
                                    onClick={() => {
                                        setSelectedArtwork(art);
                                        setIsModalOpen(false);
                                    }}
                                    className={`group cursor-pointer rounded-2xl transition-all duration-300 ${selectedArtwork?.id === art.id ? 'ring-4 ring-yellow-400 ring-offset-2' : 'hover:-translate-y-1'}`}
                                >
                                    <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow relative">
                                        <img 
                                            src={art.img} 
                                            alt={art.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        {!isRealData && (
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-white/70 backdrop-blur-sm rounded-md shadow-inner">
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px]">Sample</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-start px-1">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{art.title}</h3>
                                            
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                                                {art.artist} <span className="text-slate-300 mx-1">•</span> <span className="text-yellow-600">{art.productType}</span>
                                            </p>
                                            
                                            {art.price && (
                                                <p className="text-yellow-600 font-bold text-sm mt-1">${art.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {isRealData && (
                                                <>
                                                    <button 
                                                        onClick={(e) => toggleWishlist(e, art.id)}
                                                        className={`transition-colors ${wishlistIds.has(art.id) ? 'text-yellow-500' : 'text-slate-300 hover:text-yellow-500'}`}
                                                        title={wishlistIds.has(art.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={wishlistIds.has(art.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => toggleLike(e, art.id, art.likes_count)}
                                                        className={`transition-colors ${likedIds.has(art.id) ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
                                                        title="Like Artwork"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likedIds.has(art.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { 
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
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-1 pb-1">
                                        {art.on_sale && art.price ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedArtwork(art); setShowPaymentModal(true); }}
                                                className="w-full mt-3 py-2.5 bg-yellow-400 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                            >
                                                Purchase Now
                                            </button>
                                        ) : !isRealData ? (
                                            <div className="w-full mt-3 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                                                Sample Only
                                            </div>
                                        ) : (
                                            <div className="w-full mt-3 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs uppercase tracking-widest rounded-xl text-center">
                                                Not for sale
                                            </div>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>

                <aside 
                    className={`transition-all duration-500 ease-in-out overflow-hidden sticky top-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl flex flex-col ${selectedArtwork ? 'w-full lg:w-[35%] opacity-100 p-6' : 'w-0 opacity-0 p-0 border-none'}`}
                >
                    {selectedArtwork && (
                        <>
                            <button 
                                onClick={() => setSelectedArtwork(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors shadow-sm z-10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {isRealData && (
                                <>
                                    <button 
                                        onClick={(e) => toggleLike(e, selectedArtwork.id, selectedArtwork.likes_count || 0)}
                                        title="Like Artwork"
                                        className={`absolute top-4 right-16 w-10 h-10 bg-white rounded-full flex items-center justify-center transition-colors shadow-sm z-10 ${likedIds.has(selectedArtwork.id) ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-slate-200'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likedIds.has(selectedArtwork.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                    </button>

                                    <button 
                                        onClick={() => setIsReportModalOpen(true)}
                                        title="Report Artwork"
                                        className="absolute top-4 right-28 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-200 transition-colors shadow-sm z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            <div 
                                className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-200 mt-2 relative group cursor-pointer"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <img src={selectedArtwork.img} alt={selectedArtwork.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white drop-shadow-md">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                    {selectedArtwork.title}
                                </h2>
                                
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">
                                    By <span className="text-slate-900">{selectedArtwork.artist}</span> <span className="text-slate-300 mx-1">•</span> <span className="text-yellow-600">{selectedArtwork.productType}</span>
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                    {selectedArtwork.price && (
                                        <p className="text-slate-900 font-bold text-xl">${selectedArtwork.price.toFixed(2)}</p>
                                    )}
                                    {isRealData && selectedArtwork.likes_count !== undefined && (
                                        <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md ml-auto flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                            </svg>
                                            {selectedArtwork.likes_count}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Details</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {selectedArtwork.description}
                                    </p>
                                </div>

                                {isRealData && selectedArtwork.on_sale && selectedArtwork.price && (
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full mt-6 py-3 bg-yellow-400 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        Purchase Now
                                    </button>
                                )}
                            </div>
                        </
                        >
                    )}
                </aside>
            </div>

            {isModalOpen && selectedArtwork && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative flex items-center justify-center w-full h-full">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <button 
                            onClick={handleFullscreenRequest}
                            className="absolute top-4 right-20 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                        </button>

                        {isRealData && (
                            <button 
                                onClick={(e) => toggleLike(e, selectedArtwork.id, selectedArtwork.likes_count || 0)}
                                className={`absolute top-4 right-36 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-50 ${likedIds.has(selectedArtwork.id) ? 'text-red-500' : 'text-white'}`}
                                title="Like Artwork"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill={likedIds.has(selectedArtwork.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </button>
                        )}

                        {isRealData && (
                            <button 
                                onClick={() => setIsReportModalOpen(true)}
                                className="absolute top-4 right-52 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
                                title="Report Artwork"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                </svg>
                            </button>
                        )}

                        <img 
                            id="expanded-artwork"
                            src={selectedArtwork.img} 
                            alt={selectedArtwork.title} 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}

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
                amount={selectedArtwork?.price || 99}
                onSuccess={handlePaymentSuccess}
            />
        </section>
    );
}
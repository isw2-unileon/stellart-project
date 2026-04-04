import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PaymentModal from './PaymentModal';
import { getProfile } from '../service/apiService';

export default function ExploreGallery({ artworks = [] }) {
    
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [artistNames, setArtistNames] = useState({});

    const placeholderArtworks = [
        { id: 1, title: "Neon City", artist: "@cyber_artist", productType: "Digital", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
        { id: 2, title: "Abstract Mind", artist: "@creative_soul", productType: "Canvas", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop" },
        { id: 3, title: "Forest Guardian", artist: "@nature_art", productType: "Print", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
        { id: 4, title: "Space Odyssey", artist: "@star_gazer", productType: "Digital", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2059&auto=format&fit=crop" },
        { id: 5, title: "Digital Samurai", artist: "@blade_runner", productType: "Digital", img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop" },
        { id: 6, title: "Urban Decay", artist: "@street_vision", productType: "Photography", img: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2070&auto=format&fit=crop" },
        { id: 7, title: "Solar Flare", artist: "@astro_painter", productType: "Canvas", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1974&auto=format&fit=crop" },
        { id: 8, title: "Lost Temple", artist: "@mythos_art", productType: "Concept Art", img: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?q=80&w=2070&auto=format&fit=crop" },
        { id: 9, title: "Crystal Cave", artist: "@gem_creator", productType: "Digital", img: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=2080&auto=format&fit=crop" },
    ];

    useEffect(() => {
        const fetchProfiles = async () => {
            if (!artworks || artworks.length === 0) return;

            const uniqueArtistIds = [...new Set(artworks.map(art => art.artist_id).filter(Boolean))];
            const newNames = { ...artistNames };
            let stateNeedsUpdate = false;

            for (const id of uniqueArtistIds) {
                if (!newNames[id]) {
                    try {
                        const profileData = await getProfile(id);
                        if (profileData) {
                            // Usamos full_name porque así lo guardas al registrar al usuario
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
    }, [artworks]);

    const displayArtworks = artworks && artworks.length > 0 
        ? artworks.map((art, index) => ({
            id: art.id || `art-${index}`,
            title: art.title || "Untitled Artwork",
            artist: artistNames[art.artist_id] || "Loading artist...",
            productType: art.product_type || "Standard", 
            img: art.image_url || "https://images.unsplash.com/photo-1561214115-f2f114ce1437?q=80&w=2000&auto=format&fit=crop", 
            description: art.description || "No description provided for this artwork.",
            price: art.price || null,
            on_sale: art.on_sale || art.price != null
        })) 
        : placeholderArtworks;

    const handlePaymentSuccess = () => {
        toast.success('Purchase completed!');
        setSelectedArtwork(null);
    };

    return (
        <section className="max-w-360 mx-auto px-6 py-24">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                    {artworks && artworks.length > 0 ? 'Search Results' : 'Trending Now'}
                </h2>
            </div>

            <div className="flex items-start gap-8 transition-all duration-500 ease-in-out relative">
                
                <div className={`transition-all duration-500 ease-in-out ${selectedArtwork ? 'w-full lg:w-[65%]' : 'w-full'}`}>
                    
                    <div className={`grid gap-6 transition-all duration-500 ${selectedArtwork ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'}`}>
                        {displayArtworks.map((art) => (
                            <article 
                                key={art.id} 
                                onClick={() => setSelectedArtwork(art)}
                                className={`group cursor-pointer rounded-2xl transition-all duration-300 ${selectedArtwork?.id === art.id ? 'ring-4 ring-yellow-400 ring-offset-2' : 'hover:-translate-y-1'}`}
                            >
                                <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <img 
                                        src={art.img} 
                                        alt={art.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex justify-between items-start px-1">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{art.title}</h3>
                                        
                                        {/* Nombre del artista y tipo de obra */}
                                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                                            {art.artist} <span className="text-slate-300 mx-1">•</span> <span className="text-yellow-600">{art.productType}</span>
                                        </p>
                                        
                                        {art.price && (
                                            <p className="text-yellow-600 font-bold text-sm mt-1">${art.price.toFixed(2)}</p>
                                        )}
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); }}
                                        className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="px-1 pb-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); }}
                                        className="w-full mt-3 py-2.5 bg-yellow-400 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <aside 
                    className={`transition-all duration-500 ease-in-out overflow-hidden sticky top-8 bg-slate-50 rounded-3xl border border-slate-200 shadow-xl flex flex-col ${selectedArtwork ? 'w-full lg:w-[35%] opacity-100 p-6' : 'w-0 opacity-0 p-0 border-none'}`}
                >
                    {selectedArtwork && (
                        <>
                            <button 
                                onClick={() => setSelectedArtwork(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-slate-200 mt-2">
                                <img src={selectedArtwork.img} alt={selectedArtwork.title} className="w-full h-full object-cover" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">{selectedArtwork.title}</h2>
                                
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">
                                    By <span className="text-slate-900">{selectedArtwork.artist}</span> <span className="text-slate-300 mx-1">•</span> <span className="text-yellow-600">{selectedArtwork.productType}</span>
                                </p>
                                
                                {selectedArtwork.price && (
                                    <p className="text-slate-900 font-bold text-xl mt-2">${selectedArtwork.price.toFixed(2)}</p>
                                )}
                                
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Details</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {selectedArtwork.description}
                                    </p>
                                </div>

                                {selectedArtwork.on_sale && selectedArtwork.price && (
                                    <button 
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full mt-6 py-3 bg-yellow-400 text-slate-900 font-bold text-sm uppercase tracking-widest rounded-xl shadow-sm border border-yellow-500 hover:bg-yellow-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        Purchase Now
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </aside>

            </div>

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
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import ExploreGallery from '@/components/ExploreGallery';
import { searchArtworks } from '../service/apiService';
import { toast } from 'sonner';

export default function Explore() {
    const rollingRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // PLACEHOLDERS
    const placeholderArtworks = [
        { title: "Ciudad Neón", artist: "@cyber_artist", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
        { title: "Mente Abstracta", artist: "@creative_soul", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop" },
        { title: "Guardián del Bosque", artist: "@nature_art", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
        { title: "Odisea Espacial", artist: "@star_gazer", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2059&auto=format&fit=crop" },
        { title: "Samurai Digital", artist: "@blade_runner", img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop" },
        { title: "Sueños en Acuarela", artist: "@pastel_vibes", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2045&auto=format&fit=crop" },
    ];

    const items = [...placeholderArtworks, ...placeholderArtworks];

    useEffect(() => {
        if (artworks.length > 0 || !rollingRef.current) return;

        const el = rollingRef.current;
        const animation = gsap.to(el, {
            xPercent: -50,
            duration: 25, 
            ease: "none",
            repeat: -1,
        });

        const handleMouseEnter = (e) => {
            animation.pause();
            const card = e.target.closest('.art-card');
            if (card) gsap.to(card, { scale: 1.05, duration: 0.3 });
        };

        const handleMouseLeave = (e) => {
            animation.play();
            const card = e.target.closest('.art-card');
            if (card) gsap.to(card, { scale: 1, duration: 0.3 });
        };

        el.addEventListener("mouseenter", handleMouseEnter, true);
        el.addEventListener("mouseleave", handleMouseLeave, true);

        return () => {
            animation.kill();
            el.removeEventListener("mouseenter", handleMouseEnter, true);
            el.removeEventListener("mouseleave", handleMouseLeave, true);
        };
    }, [artworks.length]);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            toast.error('Please enter a search term');
            setArtworks([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchArtworks(searchQuery);
            
            let finalArtworks = [];
            if (Array.isArray(results)) {
                finalArtworks = results;
            } else if (results && Array.isArray(results.data)) {
                finalArtworks = results.data;
            } else if (results && Array.isArray(results.artworks)) {
                finalArtworks = results.artworks;
            } else if (results && typeof results === 'object') {
                const possibleArray = Object.values(results).find(val => Array.isArray(val));
                if (possibleArray) finalArtworks = possibleArray;
            }

            setArtworks(finalArtworks);
            
            if (finalArtworks.length > 0) {
                toast.success('Artworks found successfully');
            } else {
                toast.info('No artworks match your search');
            }
        } catch {
            toast.error('Error connecting to the search server');
        } finally {
            setIsLoading(false);
        }
    };

    const bannerText = "BEST RATED ARTWORKS FROM THE WEEK • ".repeat(15);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Explore Artworks</h1>
                        <p className="text-gray-500 font-medium text-sm md:text-base">Discover amazing artworks from talented artists around the world.</p>
                    </div>

                    <form 
                        onSubmit={handleSearch} 
                        className="w-full lg:max-w-md flex items-center bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-1.5"
                    >
                        <input
                            type="text"
                            placeholder="Search artworks..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === '') setArtworks([]);
                            }}
                            className="grow px-2 py-2 outline-none text-slate-700 bg-transparent text-base placeholder:text-slate-400"
                        />
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-full flex items-center justify-center transition-colors disabled:bg-slate-400"
                        >
                            {isLoading ? (
                                <span className="font-bold text-sm">...</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* SHOW CAROUSEL ONLY IF THERE ARE NO SEARCH RESULTS */}
            {artworks.length === 0 && (
                <>
                    <div className="w-full bg-yellow-400 py-3 overflow-hidden flex items-center border-y border-yellow-500 shadow-sm">
                        <div className="whitespace-nowrap text-black font-black uppercase tracking-[0.2em] text-sm">
                            {bannerText}
                        </div>
                    </div>

                    <div className='w-full bg-slate-50 py-12 flex flex-col justify-center overflow-hidden relative'>
                        <div className='absolute inset-y-0 left-0 w-24 md:w-40 bg-linear-to-r from-slate-50 to-transparent z-10 pointer-events-none' />
                        <div className='absolute inset-y-0 right-0 w-24 md:w-40 bg-linear-to-l from-slate-50 to-transparent z-10 pointer-events-none' />
                        
                        <div ref={rollingRef} className='flex w-fit gap-8 px-4'>
                            {items.map((art, index) => (
                                <div 
                                    key={index} 
                                    className="art-card w-72 h-80 shrink-0 bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer"
                                >
                                    <div className="h-2/3 w-full overflow-hidden bg-slate-100">
                                        <img 
                                            src={art.img} 
                                            alt={art.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    
                                    <div className="h-1/3 p-5 flex flex-col justify-center bg-white z-10 border-t border-slate-100">
                                        <h3 className="text-slate-900 text-lg font-black tracking-tight truncate">{art.title}</h3>
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{art.artist}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full bg-yellow-400 py-3 overflow-hidden flex items-center border-y border-yellow-500 shadow-sm">
                        <div className="whitespace-nowrap text-black font-black uppercase tracking-[0.2em] text-sm">
                            {bannerText}
                        </div>
                    </div>
                </>
            )}
            
            {/* RENDER EXPLOREGALLERY WITH ACTUAL DATA */}
            <ExploreGallery artworks={artworks} />
        </div>
    );
}
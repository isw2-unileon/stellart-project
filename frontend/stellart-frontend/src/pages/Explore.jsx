import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ExploreGallery from '@/components/ExploreGallery';

export default function Explore() {
    const rollingRef = useRef(null);

    // PLACEHOLDER
    const placeholderArtworks = [
        { title: "Ciudad Neón", artist: "@cyber_artist", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" },
        { title: "Mente Abstracta", artist: "@creative_soul", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop" },
        { title: "Guardián del Bosque", artist: "@nature_art", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
        { title: "Odisea Espacial", artist: "@star_gazer", img: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2059&auto=format&fit=crop" },
        { title: "Samurai Digital", artist: "@blade_runner", img: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop" },
        { title: "Sueños en Acuarela", artist: "@pastel_vibes", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2045&auto=format&fit=crop" },
    ];

    // Duplicate array to create the infinite loop effect
    const items = [...placeholderArtworks, ...placeholderArtworks];

    // Infinite carrousel animation with GSAP
    useEffect(() => {
        const el = rollingRef.current;
        const animation = gsap.to(el, {
            xPercent: -50,
            duration: 25, 
            ease: "none",
            repeat: -1,
        });

        // Stop the carrousel and scale up the card on hover
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

        // Cleanup on unmount.
        return () => {
            animation.kill();
            el.removeEventListener("mouseenter", handleMouseEnter, true);
            el.removeEventListener("mouseleave", handleMouseLeave, true);
        };
    }, []);

    // Text for the rolling banner (repeated to ensure it fills the space)
    const bannerText = "BEST RATED ARTWORKS FROM THE WEEK • ".repeat(15);

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Explore Artworks</h1>
                <p className="text-gray-500 font-medium">Discover amazing artworks from talented artists around the world.</p>
            </div>

            <div className="w-full bg-yellow-400 py-3 overflow-hidden flex items-center border-y border-yellow-500 shadow-sm">
                <div className="whitespace-nowrap text-black font-black uppercase tracking-[0.2em] text-sm">
                    {bannerText}
                </div>
            </div>

            {/* ARTWORK CARROUSEL */}
            <div className='w-full bg-slate-50 py-12 flex flex-col justify-center overflow-hidden relative'>
                
                <div className='absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none' />
                <div className='absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none' />
                
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
            <ExploreGallery />
        </div>
    );
}
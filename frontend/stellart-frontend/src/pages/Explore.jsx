import React, { useState } from 'react';
import ExploreGallery from '@/components/ExploreGallery';
import { searchArtworks } from '../service/apiService';
import { toast } from 'sonner';
import artworkEx1 from '../assets/bg-landing-artwork-1.jpeg';
import artworkEx2 from '../assets/bg-landing-artwork-6.jpeg';
import artworkEx3 from '../assets/bg-landing-artwork-2.jpeg';

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState('');
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [hasSearched, setHasSearched] = useState(false);
    const [currentSearchTerm, setCurrentSearchTerm] = useState('');

    const suggestedTags = ['Digital Art', 'Cyberpunk', 'Anime', 'Abstract', '...'];

    const handleClearSearch = () => {
        setSearchQuery('');
        setArtworks([]);
        setHasSearched(false);
        setCurrentSearchTerm('');
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (!searchQuery.trim()) {
            toast.error('Please enter a search term');
            handleClearSearch();
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
            
            setHasSearched(true);
            setCurrentSearchTerm(searchQuery);
            
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

    return (
        <div className="bg-white min-h-screen">
            {/* HERO SECTION */}
            <div className={`relative overflow-hidden bg-slate-50 border-b border-slate-200 transition-all duration-700 ease-in-out ${hasSearched ? 'pt-10 pb-12' : 'pt-16 pb-20'}`}>
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none transition-opacity duration-700">
                    <div className={`absolute top-[-20%] left-[10%] w-96 h-96 rounded-full mix-blend-multiply blur-3xl transition-colors duration-700 ${hasSearched ? 'bg-blue-200/20 opacity-40' : 'bg-yellow-300/20 opacity-70'}`}></div>
                    <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply blur-3xl opacity-70"></div>
                </div>

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                        
                        <div className={`w-full transition-all duration-700 ease-in-out text-center lg:text-left ${hasSearched ? 'max-w-4xl mx-auto lg:mx-0' : 'flex-1 lg:max-w-xl'}`}>
                            
                            {!hasSearched ? (
                                <div className="transform transition-all duration-500 opacity-100 translate-y-0">
                                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.1]">
                                        Discover <br className="hidden lg:block"/>
                                        <span className="pr-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-400">
                                            Masterpieces
                                        </span>
                                    </h1>
                                    <p className="text-slate-500 font-medium text-lg mb-8 max-w-xl mx-auto lg:mx-0">
                                        Explore thousands of amazing artworks from talented independent artists around the world. Find your next inspiration.
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-6 flex flex-col md:flex-row items-center lg:items-end justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="text-center lg:text-left">
                                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-2">
                                            Search Results
                                        </h1>
                                        <p className="text-slate-500 font-medium">
                                            Showing artworks for <span className="text-yellow-600 font-bold">"{currentSearchTerm}"</span>
                                        </p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear Search
                                    </button>
                                </div>
                            )}

                            <form 
                                id="search-form"
                                onSubmit={handleSearch} 
                                className="w-full flex items-center bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-400 ml-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by title, artist, or style..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value === '') handleClearSearch();
                                    }}
                                    className="grow px-4 py-3 outline-none text-slate-800 bg-transparent text-base font-medium placeholder:text-slate-400 placeholder:font-normal"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="bg-slate-900 hover:bg-yellow-400 hover:text-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:bg-slate-300 disabled:text-slate-500"
                                >
                                    {isLoading ? 'Searching...' : 'Explore'}
                                </button>
                            </form>

                            {/* Suggested tags */}
                            <div className={`mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-2 transition-all duration-500 ${hasSearched ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto'}`}>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1.5 mr-1">Featuring:</span>
                                {suggestedTags.map(tag => (
                                    <span 
                                        key={tag}
                                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-full shadow-sm cursor-default"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={`hidden lg:flex flex-1 relative items-center justify-center transition-all duration-700 ease-in-out ${hasSearched ? 'w-0 h-0 opacity-0 overflow-hidden' : 'w-full h-[450px] opacity-100'}`}>
                            <div className="relative w-full max-w-lg h-full">
                                {/* Middle artwork */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 z-20 hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src={artworkEx2} 
                                        alt="Featured Artwork 1" 
                                        className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white"
                                    />
                                    <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-inner">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="pr-8 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trending</p>
                                            <p className="pr-8 text-sm font-black text-slate-800">Digital art</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Third artwork seen (covered) */}
                                <img 
                                    src={artworkEx1} 
                                    alt="Featured Artwork 2" 
                                    className="absolute top-[10%] left-[5%] w-48 h-56 object-cover rounded-3xl shadow-xl z-10 border-4 border-white -rotate-6 opacity-90 hover:opacity-100 hover:z-30 transition-all duration-500 hover:scale-105 hover:-rotate-3"
                                />
                                
                                {/* First artwork seen */}
                                <img 
                                    src={artworkEx3} 
                                    alt="Featured Artwork 3" 
                                    className="absolute bottom-[5%] right-[5%] w-52 h-60 object-cover rounded-3xl shadow-xl z-30 border-4 border-white rotate-6 opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-105 hover:rotate-3"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* GALERY SECTION */}
            <div className="-mt-12 transition-transform duration-700 ease-in-out">
                <ExploreGallery artworks={artworks} />
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import ExploreGallery from '@/components/ExploreGallery';
import { searchArtworks } from '../service/apiService';
import { toast } from 'sonner';

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState('');
    const [artworks, setArtworks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
            <ExploreGallery artworks={artworks} />
        </div>
    );
}
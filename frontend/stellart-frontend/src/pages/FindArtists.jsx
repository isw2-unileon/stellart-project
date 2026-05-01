import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getArtistRanking, getArtistsWithOpenCommissions } from "../service/apiService";

export default function FindArtists() {
    const location = useLocation();
    const isCommissionPage = location.pathname === "/commissions/find";
    const [artists, setArtists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchArtists() {
            try {
                const data = isCommissionPage 
                    ? await getArtistsWithOpenCommissions() 
                    : await getArtistRanking();
                setArtists(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchArtists();
    }, [isCommissionPage]);

    const filteredArtists = searchQuery.trim() === "" 
        ? artists 
        : artists.filter(a => (a.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()));

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
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isCommissionPage ? "Find Artists for Commission" : "Artists"}</h1>
                        {isCommissionPage && <p className="text-slate-500 mt-1">Artists currently open for commissions</p>}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200 w-full md:w-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search artists..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none w-full md:w-48 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredArtists.map((artist, index) => {
                        return (
                            <Link 
                                to={isCommissionPage ? `/commission/start/${artist.id}` : `/profile/${artist.id}`} 
                                key={artist.id}
                                className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative flex flex-col items-center text-center"
                            >
                                {isCommissionPage ? (
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                ) : (
                                    searchQuery.trim() === "" && (
                                        <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-800' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            #{index + 1}
                                        </div>
                                    )
                                )}
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-slate-50 shadow-inner group-hover:border-yellow-100 transition-colors">
                                    {artist.avatar_url ? (
                                        <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-300 uppercase">
                                            {(artist.full_name || "U")[0]}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-yellow-500 transition-colors truncate w-full">
                                    {artist.full_name || "Unknown Artist"}
                                </h3>
                                {isCommissionPage ? (
                                    <div className="mt-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm font-bold">
                                        Open for commissions
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 mt-2 bg-red-50 text-red-500 px-3 py-1 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                        </svg>
                                        <span className="text-sm font-bold">{artist.total_likes || 0}</span>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
                {filteredArtists.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-bold">{isCommissionPage ? "No artists currently open for commissions." : "No artists found."}</p>
                    </div>
                )}
            </div>
        </main>
    );
}

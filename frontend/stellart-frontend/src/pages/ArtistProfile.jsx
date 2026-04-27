import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getProfile, getArtworksByArtist, getProfileSkillsAPI, likeArtwork, unlikeArtwork, getLoggedUser } from "../service/apiService";
import { toast } from "sonner";

export default function ArtistProfile() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [skills, setSkills] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState('latest');
    const [user, setUser] = useState(null);
    const [likedIds, setLikedIds] = useState(new Set());
    const [localLikes, setLocalLikes] = useState({});

    useEffect(() => {
        async function loadData() {
            try {
                const loggedUser = await getLoggedUser();
                if (loggedUser) {
                    setUser(loggedUser);
                    const userLikes = JSON.parse(localStorage.getItem(`stellart_likes_${loggedUser.id}`) || '[]');
                    setLikedIds(new Set(userLikes));
                }

                const profileData = await getProfile(id);
                setArtist(profileData);

                const skillsData = await getProfileSkillsAPI(id);
                setSkills(skillsData || []);

                const artworksData = await getArtworksByArtist(id);
                setArtworks(artworksData || []);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [id]);

    const toggleLike = async (e, artworkId, currentLikes = 0) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) { toast.error('Log in to like artworks'); return; }
        const isLiked = likedIds.has(artworkId);
        const newLiked = new Set(likedIds);
        let newCount = currentLikes;

        if (isLiked) {
            newLiked.delete(artworkId);
            newCount = Math.max(0, currentLikes - 1);
            setLikedIds(newLiked);
            localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            try { await unlikeArtwork(artworkId, user.id); } catch { toast.error('Error unliking'); }
        } else {
            newLiked.add(artworkId);
            newCount = currentLikes + 1;
            setLikedIds(newLiked);
            localStorage.setItem(`stellart_likes_${user.id}`, JSON.stringify([...newLiked]));
            setLocalLikes(prev => ({ ...prev, [artworkId]: newCount }));
            try { 
                await likeArtwork(artworkId, user.id);
                toast.success('Artwork liked');
            } catch { toast.error('Error liking'); }
        }
    };

    const sortedArtworks = [...artworks].sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'most_liked') {
            const likesA = localLikes[a.id] !== undefined ? localLikes[a.id] : (a.likes_count || 0);
            const likesB = localLikes[b.id] !== undefined ? localLikes[b.id] : (b.likes_count || 0);
            return likesB - likesA;
        }
        return 0;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Artist Not Found</h2>
                <Link to="/find-artists" className="text-yellow-500 font-bold hover:underline">Go back to Find Artists</Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 relative z-10">
                        {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-300 uppercase">
                                {(artist.full_name || "U")[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{artist.full_name}</h1>
                            {artist.open_commissions && (
                                <span className="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest rounded-full border border-emerald-100 w-fit mx-auto md:mx-0">
                                    Open for Commissions
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 leading-relaxed max-w-2xl mb-8 mx-auto md:mx-0">
                            {artist.biography || "This artist hasn't added a biography yet."}
                        </p>
                        
                        {skills.length > 0 && (
                            <div className="mt-8 w-full max-w-3xl mx-auto md:mx-0">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Artist Skills</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {skills.map(skill => (
                                        <div key={skill.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-slate-700">{skill.skill_name || skill.name || 'Unknown Skill'}</span>
                                                <span className="text-xs font-bold text-slate-400">{skill.level}/100</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                <div 
                                                    className="bg-yellow-400 h-1.5 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-black text-slate-900">Portfolio <span className="text-slate-400 text-lg">({artworks.length})</span></h2>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                            <option value="most_liked">Most Liked</option>
                        </select>
                    </div>
                </div>

                {sortedArtworks.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-bold">This artist hasn't uploaded any artworks yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {sortedArtworks.map((art) => {
                            const currentLikes = localLikes[art.id] !== undefined ? localLikes[art.id] : (art.likes_count || 0);
                            return (
                                <article 
                                    key={art.id} 
                                    className="group rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white p-3 border border-slate-100 shadow-sm hover:shadow-md"
                                >
                                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 shadow-sm relative">
                                        <Link to={`/artwork-details/${art.id}`}>
                                            <img 
                                                src={art.image_url} 
                                                alt={art.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                            />
                                        </Link>
                                    </div>
                                    <div className="flex justify-between items-start px-1">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <Link to={`/artwork-details/${art.id}`}>
                                                <h3 className="font-bold text-slate-900 text-base leading-tight truncate hover:text-yellow-500 transition-colors">
                                                    {art.title}
                                                </h3>
                                            </Link>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                                                {art.product_type || "Artwork"}
                                            </p>
                                            {art.price && (
                                                <p className="text-yellow-600 font-bold text-sm mt-1">${art.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button 
                                                onClick={(e) => toggleLike(e, art.id, currentLikes)}
                                                className={`transition-colors ${likedIds.has(art.id) ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
                                                title="Like Artwork"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likedIds.has(art.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getArtistsWithOpenCommissions, getProfile } from "../service/apiService";

export default function FindArtists() {
    const [artists, setArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchArtists() {
            try {
                const loggedUser = await getLoggedUser();
                if (!loggedUser) {
                    navigate("/login");
                    return;
                }

                const artistList = await getArtistsWithOpenCommissions();
                setArtists(artistList || []);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error loading artists");
            } finally {
                setIsLoading(false);
            }
        }
        fetchArtists();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                Find Artists
            </h1>
            <p className="text-slate-500 mb-8">
                Artists open for commission work
            </p>

            {artists.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl">
                    <p className="text-slate-500">No artists open for commissions right now.</p>
                    <Link to="/explore" className="text-yellow-600 font-medium hover:underline mt-2 inline-block">
                        Explore artworks instead
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ArtistCard({ artist }) {
    const navigate = useNavigate();

    const handleStartCommission = () => {
        navigate(`/commission/start/${artist.id}`);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                        {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-black text-yellow-500 uppercase">
                                {artist.full_name?.charAt(0) || "?"}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{artist.full_name}</h3>
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full">
                            Open for commissions
                        </span>
                    </div>
                </div>
                
                {artist.biography && (
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                        {artist.biography}
                    </p>
                )}

                <button
                    onClick={handleStartCommission}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-xl transition-colors"
                >
                    Request Commission
                </button>
            </div>
        </div>
    );
}

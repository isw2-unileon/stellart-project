import { useState, useEffect, useCallback } from "react";
import { getArtworksByArtist, deleteArtwork, deleteArtworkImage } from "../service/apiService";
import { toast } from "sonner";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ProfileGallery({ profileId }) {
    const [artworks, setArtworks] = useState([]);
    const [sortBy, setSortBy] = useState("latest");
    const [isLoading, setIsLoading] = useState(true);
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [artworkToDelete, setArtworkToDelete] = useState(null);

    const fetchArtworks = useCallback(async () => {
        if (!profileId) return;
        try {
            setIsLoading(true);
            const data = await getArtworksByArtist(profileId);
            setArtworks(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [profileId]);

    useEffect(() => {
        fetchArtworks();
    }, [fetchArtworks]);

    const handleConfirmDelete = async () => {
        if (!artworkToDelete) return;
        
        try {
            const realId = artworkToDelete.id || artworkToDelete.ID || artworkToDelete.Id;
            
            try {
                await deleteArtworkImage(artworkToDelete.image_url);
            } catch (storageError) {
                console.error(storageError);
            }

            await deleteArtwork(realId);
            setArtworks((prev) => prev.filter((a) => (a.id || a.ID || a.Id) !== realId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete artwork");
        } finally {
            setArtworkToDelete(null);
        }
    };

    const sortedArtworks = [...artworks].sort((a, b) => {
        if (sortBy === "likes") {
            return (b.likes_count || 0) - (a.likes_count || 0);
        }
        if (sortBy === "oldest") {
            return new Date(a.created_at) - new Date(b.created_at);
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <span className="text-sm font-bold text-slate-400">
                    {artworks.length} Artworks
                </span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="likes">Most Liked</option>
                </select>
            </div>

            {artworks.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                    </svg>
                    <span className="text-slate-400 font-medium">No artworks available</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sortedArtworks.map((artwork) => (
                        <div
                            key={artwork.id || artwork.ID || artwork.Id}
                            className="group relative aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center hover:border-yellow-400 transition-colors"
                        >
                            <img 
                                src={artwork.image_url} 
                                alt={artwork.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 pointer-events-none">
                                <h3 className="text-white font-bold truncate text-sm md:text-base">
                                    {artwork.title}
                                </h3>
                                <span className="text-yellow-400 font-black text-xs md:text-sm mt-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                    {artwork.likes_count || 0}
                                </span>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setArtworkToDelete(artwork);
                                    setIsDeleteDialogOpen(true);
                                }}
                                className="absolute top-3 right-3 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 scale-95 hover:scale-105 cursor-pointer pointer-events-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Artwork"
                description="Are you sure you want to delete this artwork? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage, getLoggedUser } from '../../service/apiService';
import { toast } from 'sonner';

export default function UploadInfo({ file }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [onSale, setOnSale] = useState(false);
    const [price, setPrice] = useState("");
    const [tags, setTags] = useState([]); 
    const [tagInput, setTagInput] = useState(""); 
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [productType, setProductType] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getLoggedUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            toast.error("Please select an image first");
            return;
        }
   
        if (onSale && (!price || parseFloat(price) <= 0)) {
            toast.error("Please enter a valid price greater than 0");
            return;
        }

        setLoading(true);
        try {
            const imageUrl = await uploadImage(file);

            const payload = { 
                title, 
                description: description || null,
                tags, 
                image_url: imageUrl, 
                artist_id: userId,
                price: onSale ? parseFloat(price) : null,
                product_type: productType,
                likes_count: 0
            };
            
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const res = await fetch(`${BACKEND_URL}/artworks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to save artwork details");
            }
            toast.success("Artwork successfully published");
            navigate('/explore'); 

        } catch (err) {
            toast.error("Error:", {
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault(); 
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput(""); 
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                    Artwork title <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neo-Tokyo Night"
                    className={inputClasses}
                />
            </div>

            

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this piece..."
                    className={`${inputClasses} resize-none`}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">
                    Product Type
                </label>
                <input
                    type="text"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="e.g. Digital Illustration, 3D Render, Oil Painting..."
                    className={inputClasses}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Tags</label>
                <div className="w-full min-h-12.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 transition-all shadow-sm flex flex-wrap items-center gap-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-200">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="w-4 h-4 ml-1 flex items-center justify-center rounded-full cursor-pointer hover:bg-yellow-200 hover:text-red-500 transition-colors">&times;</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
                        className="flex-1 bg-transparent min-w-30 outline-none text-slate-700 placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={onSale} 
                            onChange={(e) => {
                                setOnSale(e.target.checked);
                                if(!e.target.checked) setPrice(""); 
                            }} 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">Put on sale</span>
                        <span className="text-xs text-slate-500">Allow users to buy this work</span>
                    </div>
                </label>

                {onSale && (
                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-slate-200/70">
                        <label className="text-sm font-bold text-slate-700">
                            Set Price (USD) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                            <input
                                type="number"
                                required={onSale}
                                min="0.01"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                className={`${inputClasses} pl-10`}
                            />
                        </div>
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="mt-4 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Publishing..." : "Publish Artwork"}
            </button>
        </form>
    );
}
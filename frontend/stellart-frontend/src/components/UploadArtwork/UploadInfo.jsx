import { useState } from 'react';

export default function UploadInfo() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [onSale, setOnSale] = useState(false);
    const [tags, setTags] = useState([]); 
    const [tagInput, setTagInput] = useState(""); 

    // Main function to submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { title, description, onSale, tags };
        console.log("Sending artwork to the database...", payload);
    };

    // Function to create tag.
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            // Prevent the form from submitting by mistake.
            e.preventDefault(); 
            
            const newTag = tagInput.trim();
            
            // If the tag has text and is NOT already in the list, we add it.
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            // Clear the input so they can type the next one.
            setTagInput(""); 
        }
    };

    // Function to remove a Tag when clicking the 'X'.
    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Artwork title <span className="text-red-400">*</span></label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neo-Tokyo Night"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell the story behind this piece..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-yellow-400 transition-all text-slate-700 placeholder-slate-400 shadow-sm resize-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700">Tags</label>
                
                {/* Container "input" containing the pills (real inputs) */}
                <div className="w-full min-h-[50px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-400 transition-all shadow-sm flex flex-wrap items-center gap-2">
                    
                    {/* Render the pills */}
                    {tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-200"
                        >
                            {tag}
                            <button 
                                type="button" 
                                onClick={() => removeTag(tag)}
                                className="w-4 h-4 ml-1 flex items-center justify-center rounded-full cursor-pointer hover:bg-yellow-200 hover:text-red-500 transition-colors"
                            >
                                &times;
                            </button>
                        </span>
                    ))}

                    {/* The real input where the user types */}
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
                        className="flex-1 bg-transparent min-w-[120px] outline-none text-slate-700 placeholder-slate-400"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">Press Enter or comma (,) to add a tag.</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-yellow-200 transition-colors">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={onSale}
                        onChange={(e) => setOnSale(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">Put on sale</span>
                    <span className="text-xs text-slate-500">Allow other users to commission or buy this artwork</span>
                </div>
            </label>

            <button 
                type="submit" 
                className="mt-4 w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-yellow-400 hover:text-slate-900 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
                Publish Artwork
            </button>

        </form>
    )
}
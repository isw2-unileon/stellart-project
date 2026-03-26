import { useState, useRef } from 'react';

export default function ImageUpload() {
    // State for the uploaded image.
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Click the ref input button when the div is clicked.
    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    // When the input detects the file has been uploaded creates an object for it to be displayed.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <div
                onClick={handleImageClick}
                className="group relative w-full bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-yellow-400 shadow-sm hover:shadow-md hover:bg-yellow-50/20 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[400px]"
            >
                {preview ? (
                    // h-auto adjusts the preview aspect ratio to the image aspect ratio.
                    <img 
                        src={preview} 
                        alt="Previsualización de la obra" 
                        className="w-full h-auto rounded-3xl transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-yellow-600 transition-colors p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 text-slate-300 group-hover:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="font-bold text-lg text-slate-700">Explorar archivos</span>
                        <span className="text-sm font-normal text-slate-500">
                            Arrastra y suelta tu obra aquí <br/>
                            <span className="text-xs text-slate-400 mt-1 block">PNG, JPG o WEBP (Máx. 10MB)</span>
                        </span>
                    </div>
                )}
            </div>
            
        </div>
    );
}
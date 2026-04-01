import { useState } from "react";
import ImageUpload from "@/components/UploadArtwork/ImageUpload";
import UploadInfo from "@/components/UploadArtwork/UploadInfo";

export default function UploadArtwork() {
    const [selectedFile, setSelectedFile] = useState(null);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
            
            <div className="bg-slate-50 border-r border-slate-100 p-8 md:p-12 flex flex-col justify-center items-center">
                <div className="w-full max-w-xl">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Upload your artwork</h1>
                    <p className="text-slate-500 mb-8">Select the image you want to share with the community.</p>
                    {/* Capture the file from the child */}
                    <ImageUpload onFileSelect={setSelectedFile} />
                </div>
            </div>

            <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
                <div className="w-full max-w-md mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Artwork details</h2>
                        <div className="h-1 w-12 bg-yellow-400 rounded-full mt-3" /> 
                    </div>
                    
                    {/* Pass the captured file to the form */}
                    <UploadInfo file={selectedFile} />
                </div>
            </div>

        </div>
    );
}
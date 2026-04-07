import aw1 from "../assets/bg-landing-artwork-1.jpeg";
import aw2 from "../assets/bg-landing-artwork-2.jpeg";
import aw3 from "../assets/bg-landing-artwork-3.jpeg";
import aw4 from "../assets/bg-landing-artwork-4.jpeg";
import aw5 from "../assets/bg-landing-artwork-5.jpeg";
import aw6 from "../assets/bg-landing-artwork-6.jpeg";
import aw7 from "../assets/bg-landing-artwork-7.jpeg";
import bgLeft from "../assets/css-pattern-by-magicpattern.png";

export default function Landing() {
    return (
        <div className="relative flex flex-col lg:flex-row min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-50">
            <div className="relative w-full lg:w-2/3 flex flex-col justify-center px-8 md:px-20 py-12 z-10 bg-white shadow-[30px_0_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden">
                
                <div 
                    className="absolute inset-0 z-0 opacity-10" 
                    style={{ 
                        backgroundImage: `url(${bgLeft})`,
                        backgroundRepeat: 'repeat', 
                        backgroundPosition: 'center'
                    }}
                />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-slate-900">
                        Bring out the <br />
                        <span className="text-yellow-500 underline decoration-8 underline-offset-8">star</span> <br />
                        inside of you
                    </h1>
                    
                    <p className="font-sans text-lg md:text-xl text-slate-500 mb-10 max-w-md leading-relaxed">
                        Connect with the most vibrant community of freelance artists. Commission unique works or monetize your talent.
                    </p>

                    <div className="flex gap-4">
                        <a href="/explore">
                            <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition-colors shadow-lg cursor-pointer">
                                Explore gallery.
                            </button>
                        </a>
                    </div>
                </div>
            </div>

            <ColumnGallery />

        </div>
    )
}

function ColumnGallery() {
    const artworks = [aw1, aw2, aw6, aw3, aw4, aw5, aw7 ];

    return (
        <aside className="hidden lg:block w-1/3 relative z-0 bg-white shadow-inner brightness-85">
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                
                <div className="grid grid-cols-2 gap-6 w-[200%] transform -rotate-12 translate-x-8 translate-y-12">
                    
                    <div className="flex flex-col gap-6 -translate-y-16">
                        {artworks.slice(0, 4).map((img, index) => (
                            <img 
                                key={`col1-${index}`} 
                                src={img} 
                                alt="Artwork" 
                                className="w-full h-64 object-cover rounded-2xl shadow-xl border border-white/50" 
                            />
                        ))}
                    </div>
                    <div className="flex flex-col gap-6 translate-y-8">
                        {artworks.slice(4, 8).map((img, index) => (
                            <img 
                                key={`col2-${index}`} 
                                src={img} 
                                alt="Artwork" 
                                className="w-full h-72 object-cover rounded-2xl shadow-xl border border-white/50" 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    )
}
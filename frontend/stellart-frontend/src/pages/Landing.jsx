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
        <div className="w-full">
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

                        <div className="flex flex-wrap gap-4">
                            <a href="/explore">
                                <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition-colors shadow-lg cursor-pointer">
                                    Explore gallery
                                </button>
                            </a>
                            <a href="/register">
                                <button className="bg-transparent border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-full font-bold hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer">
                                    Join as artist
                                </button>
                            </a>
                        </div>
                    </div>
                </div>

                <ColumnGallery />
            </div>

            <FeaturesSection />
            <CtaSection />
        </div>
    )
}

function ColumnGallery() {
    const artworks = [aw1, aw2, aw6, aw3, aw4, aw5, aw7 ];

    return (
        <aside className="hidden lg:block w-1/3 relative z-0 bg-white shadow-inner brightness-85 overflow-hidden">
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


function FeaturesSection() {
    return (
        <section className="py-24 px-8 md:px-20 bg-white relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                        Everything you need to <span className="text-yellow-500">succeed</span>
                    </h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Whether you're looking for the perfect commission or ready to share your portfolio with the world, we've got you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors duration-300 shadow-sm border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.866 8.21 8.21 0 003 2.48z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Showcase your Art</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Upload your best works in high resolution. Build a stunning portfolio that attracts buyers and clients instantly.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors duration-300 shadow-sm border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Monetize your Talent</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Sell your original pieces or accept custom commissions securely. We make payments and tracking a breeze.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors duration-300 shadow-sm border border-slate-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Connect Globally</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Join thousands of artists and buyers. Discover trending styles, leave feedback, and grow your network.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section className="py-24 px-8 md:px-20 bg-yellow-400 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
                    Ready to share your vision?
                </h2>
                <p className="text-xl text-slate-800 mb-10 max-w-2xl mx-auto font-medium">
                    Create your artist profile today. It's free, takes less than 2 minutes, and puts your art in front of a global audience.
                </p>
                <a href="/register">
                    <button className="bg-slate-900 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-white hover:text-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        Join For Free
                    </button>
                </a>
            </div>
        </section>
    );
}
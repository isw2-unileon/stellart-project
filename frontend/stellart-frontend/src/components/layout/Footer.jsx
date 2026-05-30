import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm shadow-yellow-200">
                                <span className="text-black text-xs font-black">S</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-slate-900">
                                STELL<span className="text-yellow-500">ART</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Discover and collect amazing artworks from talented artists around the world.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Platform</h4>
                        <ul className="space-y-2.5">
                            <li><Link to="/explore" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Explore</Link></li>
                            <li><Link to="/commissions" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Commissions</Link></li>
                            <li><Link to="/find-artists" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Find Artists</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Account</h4>
                        <ul className="space-y-2.5">
                            <li><Link to="/profile" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Profile</Link></li>
                            <li><Link to="/wishlist" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Wishlist</Link></li>
                            <li><Link to="/profile/upload" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Upload Artwork</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">Support</h4>
                        <ul className="space-y-2.5">
                            <li><Link to="/contact" className="text-sm text-slate-400 hover:text-yellow-500 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-300 font-medium">
                        &copy; {new Date().getFullYear()} Stellart. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-slate-300 font-medium">Terms</span>
                        <span className="text-xs text-slate-300 font-medium">Privacy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
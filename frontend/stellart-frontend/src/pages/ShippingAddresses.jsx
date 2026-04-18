import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser } from "../service/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Home, Briefcase, X } from "lucide-react";

export default function ShippingAddresses() {
    const [addresses, setAddresses] = useState([
        { id: 1, address_label: 'Home', street: 'Gran Vía 1', city: 'Madrid', postal_code: '28013', country: 'Spain' }
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ address_label: '', street: '', city: '', postal_code: '', country: '' });
    
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUser() {
            const loggedUser = await getLoggedUser();
            if (!loggedUser) { navigate("/login"); return; }
            setUser(loggedUser);
     
            setIsLoading(false);
        }
        fetchUser();
    }, [navigate]);

    const handleAdd = (e) => {
        e.preventDefault();
        setAddresses([...addresses, { ...formData, id: Date.now() }]);
        setIsModalOpen(false);
        setFormData({ address_label: '', street: '', city: '', postal_code: '', country: '' });
        toast.success("Address added successfully");
    };

    const handleRemove = (id) => {
        setAddresses(prev => prev.filter(a => a.id !== id));
        toast.success("Address removed");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-10">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">Shipping Addresses</h1>
                </div>
                <div className="h-1 flex-1 bg-slate-100 rounded-full" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{addresses.length} saved</span>
            </div>

            <div className="relative bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl overflow-hidden mb-10">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-8 w-20 h-20 border-2 border-yellow-400 rounded-xl rotate-12" />
                    <div className="absolute top-6 right-16 w-14 h-14 border-2 border-sky-400 rounded-full" />
                    <div className="absolute bottom-4 left-1/3 w-16 h-16 border-2 border-violet-400 rounded-lg -rotate-6" />
                    <div className="absolute bottom-6 right-1/4 w-10 h-10 border-2 border-emerald-400 rounded-full" />
                </div>
                <div className="relative flex flex-col md:flex-row items-center gap-6 px-8 py-10">
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20 rotate-3">
                        <MapPin className="w-8 h-8 text-black" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-xl font-black text-white mb-1">Where should we deliver?</h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                            Manage your delivery points to ensure your artworks arrive safely and exactly where you want them.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black text-sm font-bold rounded-xl hover:brightness-110 hover:translate-y-[-2px] transition-all duration-300 shadow-lg shadow-yellow-500/20 shrink-0"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Add new address
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:flex flex-col gap-6 w-full lg:w-64 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overview</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Total addresses", value: String(addresses.length), icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z", color: "text-yellow-500" },
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-400">{stat.label}</p>
                                        <p className="text-sm font-black text-slate-800">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="flex-1">
                    {addresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                                <MapPin className="w-10 h-10 text-slate-200" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">No addresses yet</h2>
                            <p className="text-slate-400 text-sm max-w-sm">Add a shipping location to receive your collected artworks.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            {addresses.map((addr) => (
                                <div key={addr.id} className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-yellow-500 transition-colors">
                                                {addr.address_label.toLowerCase() === 'home' ? <Home size={18} /> : <Briefcase size={18} />}
                                            </div>
                                            <h3 className="font-bold text-slate-800">{addr.address_label}</h3>
                                        </div>
                                        <button 
                                            onClick={() => handleRemove(addr.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-600 font-medium">
                                        <p className="text-slate-900 font-bold">{addr.street}</p>
                                        <p>{addr.city}, {addr.postal_code}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-bold">{addr.country}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tighter">New Destination</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input placeholder="Label (Home, Office...)" value={formData.address_label} onChange={e => setFormData({...formData, address_label: e.target.value})} required className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12" />
                            <Input placeholder="Street Address" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12" />
                                <Input placeholder="ZIP" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} required className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12" />
                            </div>
                            <Input placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required className="rounded-xl border-slate-100 bg-slate-50 focus:bg-white h-12" />
                            <Button type="submit" className="w-full bg-slate-900 text-white font-black py-7 rounded-2xl mt-2 hover:bg-yellow-500 hover:text-slate-900 transition-all shadow-lg">
                                Save Address
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
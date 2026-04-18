import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, createAddress } from "../service/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, Home, Briefcase, X } from "lucide-react";

export default function ShippingAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ 
        address_label: '', 
        street: '', 
        city: '', 
        postal_code: '', 
        country: '' 
    });
    
    const navigate = useNavigate();

    useEffect(() => {
        async function checkSession() {
            const loggedUser = await getLoggedUser();
            if (!loggedUser) { 
                navigate("/login"); 
                return; 
            }
            setIsLoading(false);
        }
        checkSession();
    }, [navigate]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const savedAddress = await createAddress(formData);
            
            setAddresses(prev => [...prev, savedAddress]);
            setIsModalOpen(false);
            setFormData({ address_label: '', street: '', city: '', postal_code: '', country: '' });
            toast.success("Address saved successfully");
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
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
                    <MapPin className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">Shipping Addresses</h1>
                </div>
                <div className="h-1 flex-1 bg-slate-100 rounded-full" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{addresses.length} saved</span>
            </div>

            <div className="relative bg-slate-900 rounded-3xl overflow-hidden mb-10 p-10 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <MapPin className="w-8 h-8 text-black" />
                </div>
                <div className="flex-1 text-center md:text-left text-white">
                    <h2 className="text-xl font-black mb-1">Where should we deliver?</h2>
                    <p className="text-slate-400 text-sm">Manage your delivery points to ensure your artworks arrive safely.</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 py-6 rounded-xl"
                >
                    <Plus className="mr-2 h-5 w-5" strokeWidth={3} /> Add new address
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-slate-400 font-medium">No addresses saved yet.</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <div key={addr.id} className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-yellow-500">
                                        {addr.address_label?.toLowerCase() === 'home' ? <Home size={18} /> : <Briefcase size={18} />}
                                    </div>
                                    <h3 className="font-bold text-slate-800">{addr.address_label}</h3>
                                </div>
                                <button onClick={() => handleRemove(addr.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600 font-medium">
                                <p className="text-slate-900 font-bold">{addr.street}</p>
                                <p>{addr.city}, {addr.postal_code}</p>
                                <p className="text-xs text-slate-400 uppercase font-bold">{addr.country}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-colors">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tighter">New Destination</h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input placeholder="Label (Home, Office...)" value={formData.address_label} onChange={e => setFormData({...formData, address_label: e.target.value})} required className="h-12 rounded-xl bg-slate-50 border-none" />
                            <Input placeholder="Street Address" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required className="h-12 rounded-xl bg-slate-50 border-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required className="h-12 rounded-xl bg-slate-50 border-none" />
                                <Input placeholder="ZIP Code" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} required className="h-12 rounded-xl bg-slate-50 border-none" />
                            </div>
                            <Input placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required className="h-12 rounded-xl bg-slate-50 border-none" />
                            <Button type="submit" className="w-full bg-slate-900 text-white font-black py-7 rounded-2xl mt-4 hover:bg-yellow-500 hover:text-slate-900 transition-all">
                                Save Address
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
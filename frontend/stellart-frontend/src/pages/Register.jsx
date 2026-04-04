import { useState } from 'react';
import { registerUser } from '../service/apiService';
import { toast } from 'sonner';

export default function Register() {
    const [userData, setUserData] = useState({ name: '', email: '', password: '' });
    const [addressData, setAddressData] = useState({ street: '', city: '', postal_code: '', country: '' });
    const [bankData, setBankData] = useState({ account_number: '' });

    const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
    const handleAddressChange = (e) => setAddressData({ ...addressData, [e.target.name]: e.target.value });
    const handleBankChange = (e) => setBankData({ ...bankData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(
                userData.email, 
                userData.password, 
                userData.name,
                addressData,
                bankData
            );
            
            toast.success("Successfully registered! Please verify your email.");
        } catch (error) {
            alert("Error: " + error.message || "Error at register user");
        }
    };

    return (
        <div className="flex flex-col gap-10 py-12 px-4 bg-slate-50 min-h-screen"> 

            <div className="flex flex-col items-center text-center">
                <div className="inline-block mb-2">
                    <h1 className="text-5xl md:text-6xl font-black text-[#0f172a] tracking-tighter">
                        Register
                    </h1>
                    <div className="w-full h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                
                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-2">
                    Bring out the <span className="text-yellow-500">star</span> inside of you 
                </p>
            </div>
      
            <div className="w-full"> 
                <div className="w-full max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
                        
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-md shadow-yellow-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.719Z" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-800 text-2xl tracking-tight">User Details</h3>
                            </div>
                            
                            <input name="name" type="text" placeholder="Full name" value={userData.name} onChange={handleUserChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                            <input name="email" type="email" placeholder="Email" value={userData.email} onChange={handleUserChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                            <input name="password" type="password" placeholder="Password" value={userData.password} onChange={handleUserChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-md shadow-yellow-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-800 text-2xl tracking-tight">Shipping Address</h3>
                            </div>

                            <input name="street" type="text" placeholder="Street Address" value={addressData.street} onChange={handleAddressChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="city" type="text" placeholder="City" value={addressData.city} onChange={handleAddressChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                                <input name="postal_code" type="text" placeholder="Postal Code" value={addressData.postal_code} onChange={handleAddressChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                            </div>
                            <input name="country" type="text" placeholder="Country" value={addressData.country} onChange={handleAddressChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-md shadow-yellow-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                    </svg>
                                </div>
                                <h3 className="font-black text-slate-800 text-2xl tracking-tight">Bank Details</h3>
                            </div>

                            <input name="account_number" type="text" placeholder="IBAN / Account Number" value={bankData.account_number} onChange={handleBankChange} className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-yellow-400 outline-none transition-all font-medium text-slate-700" required />
                        </div>

                        <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-5 rounded-2xl hover:bg-yellow-500 hover:text-black hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-200 transition-all duration-300 mt-4 text-xl">
                            Sign up & Save Details
                        </button>
                    </form>
                    
                    <p className="text-center text-lg font-medium text-slate-500 mt-10">
                        Already registered? <a href="/login" className="text-yellow-500 font-black hover:underline hover:text-yellow-600 transition-colors">Log in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
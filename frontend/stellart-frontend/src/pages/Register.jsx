import { useState } from 'react';
import { registerUser } from '../service/apiService';
import { toast } from 'sonner';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(formData.email, formData.password, formData.name);
            
            toast.success("Successfully registered! Please verify your email.");
        } catch (error) {
            alert("Error " + error.message || "Error at resgister user");
        }
    };

    return (
        <div className="flex flex-col gap-10 py-12"> 
            
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
                <div className="w-full max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <input 
                            name="name"
                            type="text" 
                            placeholder="Full name" 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                            required
                        />
                        <input 
                            name="email"
                            type="email" 
                            placeholder="Email" 
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                            required
                        />
                        <input 
                            name="password"
                            type="password" 
                            placeholder="Password" 
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                            required
                        />
                        <button 
                            type="submit" 
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg shadow-md"
                        >
                            Sign up
                        </button>
                    </form>
                    <p className="text-center text-base text-slate-500 mt-8">
                        ¿Already registered? <a href="/login" className="text-black font-bold hover:underline">Log in</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
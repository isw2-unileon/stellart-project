import { useState } from 'react';
import { registerUser } from '../service/apiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Register() {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }

        try {
            await registerUser(formData.email, formData.password, formData.name);
            toast.success("Account created!", {
                description: "Please verify your email to continue."
            });
            navigate("/login");
        } catch (err) {
            toast.error("Error:", {
                description: err.message
            });
        }
    };

    return (
        <div className="flex flex-col items-center py-12">
            
            <div className="flex flex-col items-center text-center mb-8">
                <div className="inline-block mb-2">
                    <h1 className="text-5xl md:text-6xl font-black text-[#0f172a] tracking-tighter">
                        Register
                    </h1>
                    <div className="w-full h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                
                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-2">
                    Become a <span className="text-yellow-500">star</span>
                </p>
            </div>

            <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <input 
                        name="name"
                        type="text" 
                        placeholder="Full Name" 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Password" 
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <input 
                        name="confirmPassword"
                        type="password" 
                        placeholder="Confirm Password" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    
                    <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg">
                        Create Account
                    </button>
                </form>

                <p className="text-center text-slate-500 mt-6 font-medium">
                    Already have an account? <a href="/login" className="text-yellow-600 font-bold hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
}
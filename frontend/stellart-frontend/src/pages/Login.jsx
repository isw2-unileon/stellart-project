import { useState } from 'react';
import { loginUser } from '../service/apiService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginUser(formData.email, formData.password);
            navigate("/");
            window.location.reload();
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
                        Log in
                    </h1>
                    <div className="w-full h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                
                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-2">
                    Welcome back, <span className="text-yellow-500">star</span>
                </p>
            </div>
            <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Email" 
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Password" 
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg">
                        Step in
                    </button>
                </form>
            </div>
        </div>
    );
}
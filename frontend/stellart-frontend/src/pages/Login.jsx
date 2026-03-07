import { useState } from 'react';
import { loginUser } from '../service/apiService';
import { useNavigate } from 'react-router-dom';

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
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    return (
        <div className="flex flex-col items-center py-12">
            <h1 className="text-5xl font-black mb-8 tracking-tighter text-[#0f172a]">Iniciar Sesión</h1>
            <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Correo electrónico" 
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Contraseña" 
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                        required
                    />
                    <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
import { useState } from 'react';

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
        const response = await fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        // Intentamos obtener el texto del error
        const text = await response.text();

        if (response.ok) {
            alert("Usuario registrado con éxito. Revisa tu correo.");
        } else {
            alert(text.replace("Error: ", "")); 
        }
    } catch (error) {
        alert("No se pudo conectar con el servidor.");
    }
};

    return (
        <div className="w-full"> 
            <div className="w-full max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <input 
                        name="name"
                        type="text" 
                        placeholder="Nombre completo" 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                        required
                    />
                    <input 
                        name="email"
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                        required
                    />
                    <input 
                        name="password"
                        type="password" 
                        placeholder="Contraseña" 
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg shadow-md"
                    >
                        Registrarse
                    </button>
                </form>
                <p className="text-center text-base text-slate-500 mt-8">
                    ¿Ya tienes cuenta? <a href="/login" className="text-black font-bold hover:underline">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}
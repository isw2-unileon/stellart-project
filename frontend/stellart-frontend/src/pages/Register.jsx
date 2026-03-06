export default function Register() {
    return (
        <div className="w-full"> 
            <div className="w-full max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                <form className="flex flex-col gap-5">
                    <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                    />
                    <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white outline-none transition-all text-base" 
                    />
                    
                    <button 
                        type="button" 
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
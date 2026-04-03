import { useState } from 'react';
import { submitContact } from '../service/apiService';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            await submitContact(formData);
            setStatus('success');
            setFormData({ name: '', title: '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col items-center py-12 px-4">
            <div className="flex flex-col items-center text-center mb-10">
                <div className="inline-block mb-2">
                    <h1 className="text-5xl md:text-6xl font-black text-[#0f172a] tracking-tighter">
                        Contact
                    </h1>
                    <div className="w-full h-1.5 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                
                <p className="text-xl md:text-2xl font-bold text-slate-500 mb-2 max-w-md">
                    Found an issue? We're here to <span className="text-yellow-500">help</span>.
                </p>
            </div>

            <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h3>
                        <p className="text-slate-500 mb-6">We'll get back to you soon.</p>
                        <button 
                            onClick={() => setStatus('idle')}
                            className="text-sm font-bold text-slate-600 hover:text-black transition-colors"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        <input 
                            name="name"
                            type="text" 
                            placeholder="Name" 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                            required
                        />
                        <input 
                            name="title"
                            type="text" 
                            placeholder="Title" 
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all" 
                            required
                        />
                        <textarea 
                            name="message"
                            placeholder="How can we help?" 
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-transparent focus:border-slate-300 outline-none transition-all resize-none" 
                            required
                        />
                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center">Failed to send. Please try again.</p>
                        )}
                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors mt-2 text-lg disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send message'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

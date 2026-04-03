import React, { useState } from 'react';
import { toast } from 'sonner';
import { formatCardNumber, formatExpiry, validateCardNumber, validateExpiry, validateCVC } from '../utils/paymentUtils';

export default function PaymentModal({ 
    isOpen, 
    onClose, 
    item, 
    amount, 
    paymentType = 'full', 
    onSuccess, 
    onFailure 
}) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const isPartial = paymentType === 'partial' || paymentType === 'advance' || paymentType === 'remaining';
    const displayAmount = amount || 99;

    const validate = () => {
        const newErrors = {};
        
        if (!cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required';
        } else if (!validateCardNumber(cardNumber)) {
            newErrors.cardNumber = 'Invalid card number';
        }
        
        if (!expiry.trim()) {
            newErrors.expiry = 'Expiry date is required';
        } else if (!validateExpiry(expiry)) {
            newErrors.expiry = 'Invalid or expired date';
        }
        
        if (!cvc.trim()) {
            newErrors.cvc = 'CVC is required';
        } else if (!validateCVC(cvc)) {
            newErrors.cvc = 'Invalid CVC';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error('Please fix the errors before proceeding');
            return;
        }

        setIsProcessing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (onSuccess) {
                onSuccess({ cardNumber: cardNumber.replace(/\s+/g, '').slice(-4), amount: displayAmount });
            }
            
            resetForm();
            onClose();
        } catch (error) {
            if (onFailure) {
                onFailure(error);
            }
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setErrors({});
    };

    const handleClose = () => {
        if (!isProcessing) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    const getTitle = () => {
        if (isPartial) {
            return paymentType === 'advance' ? 'Pay Advance (50%)' : 'Pay Remaining Balance';
        }
        return 'Secure Checkout';
    };

    const getDescription = () => {
        if (isPartial) {
            return paymentType === 'advance' 
                ? 'Pay 50% now, remaining upon completion' 
                : 'Complete your payment';
        }
        return 'Complete your purchase securely';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isProcessing && handleClose()}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={handleClose}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{getTitle()}</h3>
                    <p className="text-slate-500 text-sm mt-2">{getDescription()}</p>
                </div>

                {item && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                        <div className="flex gap-4">
                            <img 
                                src={item.img} 
                                alt={item.title}
                                className="w-20 h-20 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{item.title}</h4>
                                <p className="text-slate-500 text-sm">{item.artist}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Card Number</label>
                        <input 
                            type="text" 
                            placeholder="4111 1111 1111 1111"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            maxLength={19}
                            disabled={isProcessing}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 ${errors.cardNumber ? 'border-red-500' : 'border-slate-200'}`}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expiry</label>
                            <input 
                                type="text" 
                                placeholder="MM/YY"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                disabled={isProcessing}
                                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 ${errors.expiry ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CVC</label>
                            <input 
                                type="text" 
                                placeholder="123"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                maxLength={3}
                                disabled={isProcessing}
                                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 ${errors.cvc ? 'border-red-500' : 'border-slate-200'}`}
                            />
                            {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                        </div>
                    </div>
                </form>

                <button 
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="w-full py-4 bg-yellow-400 text-slate-900 font-bold text-base uppercase tracking-widest rounded-xl shadow-lg hover:bg-yellow-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Pay ${displayAmount.toFixed(2)}
                        </>
                    )}
                </button>

                <p className="text-center text-slate-400 text-xs mt-4">
                    This is a demo. No real payment is processed.
                </p>
            </div>
        </div>
    );
}

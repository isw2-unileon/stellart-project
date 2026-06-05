import { useState } from 'react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { 
    Elements, 
    CardNumberElement, 
    CardExpiryElement, 
    CardCvcElement, 
    useStripe, 
    useElements 
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../service/apiService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BASE_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#0f172a',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            '::placeholder': { color: '#94a3b8' },
        },
        invalid: { color: '#ef4444' },
    },
};

// Inner form that has access to Stripe hooks
function CheckoutForm({ amount, paymentType, metadata, onSuccess, onFailure, onClose, item }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState(null);

    const isPartial = paymentType === 'partial' || paymentType === 'advance' || paymentType === 'remaining';
    const displayAmount = amount || 0;

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
        return 'Complete your purchase securely via Stripe';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setCardError(null);

        try {
            // 1. Create PaymentIntent on backend
            const { client_secret } = await createPaymentIntent(displayAmount, 'eur', metadata || {});

            // 2. Confirm card payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: { card: elements.getElement(CardNumberElement) },
            });

            if (error) {
                setCardError(error.message);
                if (onFailure) onFailure(error);
                toast.error(error.message || 'Payment failed');
            } else if (paymentIntent.status === 'succeeded') {
                if (onSuccess) onSuccess({ paymentIntentId: paymentIntent.id, amount: displayAmount });
                toast.success('Payment successful!');
                onClose();
            }
        } catch (err) {
            setCardError(err.message);
            if (onFailure) onFailure(err);
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <button
                onClick={() => !isProcessing && onClose()}
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
                            src={item.img || item.image_url}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                            {item.artist && <p className="text-slate-500 text-sm">{item.artist}</p>}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Card Number</label>
                    <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all">
                        <CardNumberElement 
                            options={{
                                ...BASE_ELEMENT_OPTIONS, 
                                showIcon: true,
                                placeholder: '0000 1234 5678 9012'
                            }} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expiration</label>
                        <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all">
                            <CardExpiryElement 
                                options={{
                                    ...BASE_ELEMENT_OPTIONS,
                                    placeholder: 'MM / YY'
                                }} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">CVC</label>
                        <div className="px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-transparent transition-all">
                            <CardCvcElement 
                                options={{
                                    ...BASE_ELEMENT_OPTIONS,
                                    placeholder: '123'
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {cardError && <p className="text-red-500 text-xs text-center mt-2">{cardError}</p>}

                <button
                    type="submit"
                    disabled={isProcessing || !stripe}
                    className="w-full py-4 mt-2 bg-yellow-400 text-slate-900 font-bold text-base uppercase tracking-widest rounded-xl shadow-lg hover:bg-yellow-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            Pay €{displayAmount.toFixed(2)}
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-slate-400 text-xs mt-4">
                Powered by Stripe · Test mode
            </p>
        </>
    );
}

// Outer wrapper that provides Stripe context
export default function PaymentModal({
    isOpen,
    onClose,
    item,
    amount,
    paymentType = 'full',
    metadata,
    onSuccess,
    onFailure
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                <Elements stripe={stripePromise} options={{ locale: 'en' }}>
                    <CheckoutForm
                        amount={amount}
                        paymentType={paymentType}
                        metadata={metadata}
                        onSuccess={onSuccess}
                        onFailure={onFailure}
                        onClose={onClose}
                        item={item}
                    />
                </Elements>
            </div>
        </div>
    );
}
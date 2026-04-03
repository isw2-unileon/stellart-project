import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getProfile, createCommission, createAdvancePayment, markPaymentPaid } from "../service/apiService";
import { Button } from "../components/ui/button";
import PaymentModal from "../components/PaymentModal";

export default function StartCommission() {
    const { artistId } = useParams();
    const [user, setUser] = useState(null);
    const [artist, setArtist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        deadline: ""
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const loggedUser = await getLoggedUser();
                if (!loggedUser) {
                    navigate("/login");
                    return;
                }
                setUser(loggedUser);

                const artistProfile = await getProfile(artistId);
                if (!artistProfile) {
                    toast.error("Artist not found");
                    navigate("/commissions/find");
                    return;
                }
                setArtist(artistProfile);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error loading data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [artistId, navigate]);

    const advanceAmount = parseFloat(formData.price || 0) * 0.5;

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.price) {
            toast.error("Please fill in all required fields");
            return;
        }
        setStep(2);
    };

    const handleConfirmAndPay = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentInfo) => {
        setIsSubmitting(true);
        try {
            const commissionData = {
                commission_id: `comm_${Date.now()}`,
                buyer_id: user.id,
                artist_id: artistId,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                deadline: formData.deadline
            };

            const commission = await createCommission(commissionData);
            
            const paymentData = {
                payment_id: `pay_${Date.now()}`,
                commission_id: commission.id || commissionData.commission_id,
                amount: advanceAmount,
                payment_intent: `pi_${Date.now()}`
            };
            await createAdvancePayment(paymentData);
            await markPaymentPaid(commission.id || commissionData.commission_id);
            
            setShowPaymentModal(false);
            toast.success("Commission requested! Payment successful.");
            navigate("/commissions");
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to create commission");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-12">
            <Link to="/commissions/find" className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block">
                ← Back to artists
            </Link>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                Request Commission
            </h1>
            <p className="text-slate-500 mb-8">
                Request a commission from <span className="font-bold text-slate-900">{artist?.full_name}</span>
            </p>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-yellow-500 text-black' : 'bg-slate-200 text-slate-500'} font-bold text-sm`}>1</div>
                <div className={`h-1 flex-1 ${step >= 2 ? 'bg-yellow-500' : 'bg-slate-200'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-yellow-500 text-black' : 'bg-slate-200 text-slate-500'} font-bold text-sm`}>2</div>
            </div>

            {step === 1 ? (
                <form onSubmit={handleNext} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Character Illustration"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe what you want in detail..."
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Budget (USD) *
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="100"
                                min="1"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Deadline (optional)
                            </label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full">
                            Continue to Payment
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Commission Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Title</span>
                                <span className="font-medium text-slate-900">{formData.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Budget</span>
                                <span className="font-medium text-slate-900">${formData.price}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                                <span className="text-slate-500">Advance Payment (50%)</span>
                                <span className="font-bold text-yellow-600">${advanceAmount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-bold text-yellow-800">Payment Required</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Advance payment of ${advanceAmount} is required to start the commission. 
                                    You can pay the remaining 50% after the artist submits the work for review.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handleConfirmAndPay} disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? "Processing..." : `Confirm & Pay $${advanceAmount}`}
                        </Button>
                    </div>
                </div>
            )}

            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)}
                amount={advanceAmount}
                paymentType="advance"
                onSuccess={handlePaymentSuccess}
                onFailure={(error) => toast.error('Payment failed')}
            />
        </div>
    );
}

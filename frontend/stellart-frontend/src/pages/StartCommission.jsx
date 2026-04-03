import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getProfile, createCommission } from "../service/apiService";
import { Button } from "../components/ui/button";

export default function StartCommission() {
    const { artistId } = useParams();
    const [user, setUser] = useState(null);
    const [artist, setArtist] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.price) {
            toast.error("Please fill in all required fields");
            return;
        }

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

            await createCommission(commissionData);
            toast.success("Commission request sent!");
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? "Sending..." : "Send Commission Request"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

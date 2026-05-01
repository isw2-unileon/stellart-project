import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getBuyerCommissions, getArtistCommissions, getProfile, updateOpenCommissions } from "../service/apiService";
import { Button } from "../components/ui/button";

export default function Commissions() {
    const [user, setUser] = useState(null);
    const [buyerCommissions, setBuyerCommissions] = useState([]);
    const [artistCommissions, setArtistCommissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("buyer");
    const [openCommissions, setOpenCommissions] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const loggedUser = await getLoggedUser();
                if (!loggedUser) {
                    navigate("/login");
                    return;
                }
                setUser(loggedUser);

                const [buyerComms, artistComms, profile] = await Promise.all([
                    getBuyerCommissions(loggedUser.id).catch(() => []),
                    getArtistCommissions(loggedUser.id).catch(() => []),
                    getProfile(loggedUser.id).catch(() => null)
                ]);

                setBuyerCommissions(buyerComms || []);
                setArtistCommissions(artistComms || []);
                setOpenCommissions(profile?.open_commissions || false);
        } catch {
                toast.error("Error loading commissions");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [navigate]);

    const handleToggleOpenCommissions = async () => {
        try {
            const newValue = !openCommissions;
            await updateOpenCommissions(user.id, newValue);
            setOpenCommissions(newValue);
            toast.success(newValue ? "Commissions are now OPEN" : "Commissions are now CLOSED");
        } catch {
            toast.error("Failed to update");
        }
    };

    const commissions = activeTab === "buyer" ? buyerCommissions : artistCommissions;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">My Commissions</h1>
                    <p className="text-slate-500 mt-1">Manage your commissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                        <span className="text-sm font-medium text-slate-600">Open for Commissions</span>
                        <button
                            onClick={handleToggleOpenCommissions}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                openCommissions ? "bg-yellow-500" : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                    openCommissions ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                    <Link to="/commissions/find">
                        <Button variant="outline">Find Artists</Button>
                    </Link>
                </div>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
                <button
                    onClick={() => setActiveTab("buyer")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeTab === "buyer" 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    As Buyer ({buyerCommissions.length})
                </button>
                <button
                    onClick={() => setActiveTab("artist")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeTab === "artist" 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    As Artist ({artistCommissions.length})
                </button>
            </div>

            {commissions.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-3xl">
                    <p className="text-slate-500">
                        {activeTab === "buyer" 
                            ? "You haven't requested any commissions yet." 
                            : "You don't have any commission requests."}
                    </p>
                    {activeTab === "buyer" && (
                        <Link to="/commissions/find" className="text-yellow-600 font-medium hover:underline mt-2 inline-block">
                            Find artists to commission
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {commissions.map((commission) => (
                        <CommissionCard 
                            key={commission.id} 
                            commission={commission} 
                            role={activeTab}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CommissionCard({ commission }) {
    const statusColors = {
        pending: "bg-slate-100 text-slate-600",
        accepted: "bg-blue-50 text-blue-600",
        in_progress: "bg-yellow-50 text-yellow-600",
        review: "bg-purple-50 text-purple-600",
        revised: "bg-orange-50 text-orange-600",
        completed: "bg-green-50 text-green-600",
        refunded: "bg-red-50 text-red-600",
        cancelled: "bg-slate-100 text-slate-400"
    };

    const statusLabels = {
        pending: "Pending",
        accepted: "Accepted",
        in_progress: "In Progress",
        review: "In Review",
        revised: "Revised",
        completed: "Completed",
        refunded: "Refunded",
        cancelled: "Cancelled"
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{commission.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[commission.status] || statusColors.pending}`}>
                            {statusLabels[commission.status] || "Pending"}
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">{commission.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-slate-900">${commission.price}</span>
                        <span className="text-slate-400">
                            {new Date(commission.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <Link to={`/commissions/${commission.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                </Link>
            </div>
        </div>
    );
}

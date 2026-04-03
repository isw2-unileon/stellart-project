import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getProfile, updateOpenCommissions } from "../service/apiService";
import { Button } from "../components/ui/button";

export default function OpenCommissions() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
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

                const profile = await getProfile(loggedUser.id);
                if (profile) {
                    setOpenCommissions(profile.open_commissions || false);
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error loading profile");
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
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to update");
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
        <div className="max-w-3xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-8">
                Commission Settings
            </h1>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Open for Commissions</h2>
                        <p className="text-slate-500 mt-1">
                            {openCommissions 
                                ? "Buyers can now start commissions with you" 
                                : "Your profile is hidden from commission requests"}
                        </p>
                    </div>
                    <button
                        onClick={handleToggleOpenCommissions}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            openCommissions ? "bg-yellow-500" : "bg-slate-200"
                        }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                                openCommissions ? "translate-x-7" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <Link to="/commissions">
                    <Button className="w-full">
                        View My Commissions
                    </Button>
                </Link>
            </div>
        </div>
    );
}

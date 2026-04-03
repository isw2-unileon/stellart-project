import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getCommission, getProfile, getWorkUploads, getMessages, sendMessage, markMessagesRead, acceptCommission, startCommission, submitForReview, approveWork, createAdvancePayment, markPaymentPaid, releasePayment, requestRevision, uploadImage, getRefund, createRefund } from "../service/apiService";
import { Button } from "../components/ui/button";

export default function CommissionDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [commission, setCommission] = useState(null);
    const [artist, setArtist] = useState(null);
    const [buyer, setBuyer] = useState(null);
    const [workUploads, setWorkUploads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
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

                const comm = await getCommission(id);
                if (!comm) {
                    toast.error("Commission not found");
                    navigate("/commissions");
                    return;
                }
                setCommission(comm);

                const [artistProfile, buyerProfile, uploads, msgs] = await Promise.all([
                    getProfile(comm.artist_id).catch(() => null),
                    getProfile(comm.buyer_id).catch(() => null),
                    getWorkUploads(id).catch(() => []),
                    getMessages(id).catch(() => [])
                ]);

                setArtist(artistProfile);
                setBuyer(buyerProfile);
                setWorkUploads(uploads || []);
                setMessages(msgs || []);

                await markMessagesRead(id, loggedUser.id);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error loading commission");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const msg = {
                message_id: `msg_${Date.now()}`,
                commission_id: id,
                sender_id: user.id,
                content: newMessage
            };
            await sendMessage(msg);
            setMessages([...messages, { ...msg, created_at: new Date().toISOString() }]);
            setNewMessage("");
        } catch (error) {
            toast.error("Failed to send message");
        }
    };

    const handleAccept = async () => {
        try {
            await acceptCommission(id);
            setCommission({ ...commission, status: "accepted" });
            toast.success("Commission accepted!");
        } catch (error) {
            toast.error("Failed to accept");
        }
    };

    const handleStart = async () => {
        try {
            await startCommission(id);
            setCommission({ ...commission, status: "in_progress" });
            toast.success("Commission started!");
        } catch (error) {
            toast.error("Failed to start");
        }
    };

    const handleSubmitForReview = async () => {
        try {
            await submitForReview(id);
            setCommission({ ...commission, status: "review" });
            toast.success("Submitted for review!");
        } catch (error) {
            toast.error("Failed to submit");
        }
    };

    const handleApprove = async () => {
        try {
            await approveWork(id);
            setCommission({ ...commission, status: "completed" });
            toast.success("Work approved!");
        } catch (error) {
            toast.error("Failed to approve");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    const isBuyer = user?.id === commission?.buyer_id;
    const isArtist = user?.id === commission?.artist_id;

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <Link to="/commissions" className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block">
                ← Back to commissions
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-black text-slate-900">{commission.title}</h1>
                            <StatusBadge status={commission.status} />
                        </div>
                        <p className="text-slate-600 mb-4">{commission.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500">Budget</p>
                                <p className="text-xl font-bold text-slate-900">${commission.price}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500">{isBuyer ? "Artist" : "Buyer"}</p>
                                <p className="font-bold text-slate-900">
                                    {isBuyer ? artist?.full_name : buyer?.full_name}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            {commission.status === "pending" && isArtist && (
                                <Button onClick={handleAccept}>Accept Commission</Button>
                            )}
                            {commission.status === "accepted" && isArtist && (
                                <Button onClick={handleStart}>Start Work</Button>
                            )}
                            {commission.status === "in_progress" && isArtist && (
                                <Button onClick={handleSubmitForReview}>Submit for Review</Button>
                            )}
                            {(commission.status === "review" || commission.status === "revised") && isBuyer && (
                                <Button onClick={handleApprove}>Approve Work</Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Work Uploads</h2>
                        {workUploads.length === 0 ? (
                            <p className="text-slate-500 text-sm">No work uploaded yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {workUploads.map((upload) => (
                                    <div key={upload.id} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                                        <img src={upload.image_url} alt="Work" className="w-full h-full object-cover" />
                                        {upload.watermarked && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-white/30 text-4xl font-black rotate-45">PREVIEW</span>
                                            </div>
                                        )}
                                        {upload.is_final && (
                                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                Final
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Chat</h2>
                        <div className="h-64 overflow-y-auto space-y-3 mb-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id || msg.message_id}
                                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                            msg.sender_id === user?.id
                                                ? "bg-yellow-500 text-slate-900"
                                                : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-xs opacity-60 mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-yellow-500 outline-none text-sm"
                            />
                            <Button type="submit" size="sm">Send</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
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
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status] || statusColors.pending}`}>
            {statusLabels[status] || "Pending"}
        </span>
    );
}

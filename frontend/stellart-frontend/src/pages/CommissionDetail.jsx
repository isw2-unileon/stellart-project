import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { getLoggedUser, getCommission, getProfile, getWorkUploads, getMessages, sendMessage, markMessagesRead, acceptCommission, startCommission, submitForReview, approveWork, createAdvancePayment, markPaymentPaid, releasePayment, requestRevision, uploadImage, uploadWork, getAdvancePayment, getRevisions, createRemainingPayment, getRemainingPayment, markRemainingPaymentPaid } from "../service/apiService";
import { Button } from "../components/ui/button";
import PaymentModal from "../components/PaymentModal";

export default function CommissionDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [commission, setCommission] = useState(null);
    const [artist, setArtist] = useState(null);
    const [buyer, setBuyer] = useState(null);
    const [workUploads, setWorkUploads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [payment, setPayment] = useState(null);
    const [remainingPayment, setRemainingPayment] = useState(null);
    const [revisions, setRevisions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadNotes, setUploadNotes] = useState("");
    const [revisionNotes, setRevisionNotes] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAction, setPaymentAction] = useState(null);
    const [finalUploadFile, setFinalUploadFile] = useState(null);
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

                const [artistProfile, buyerProfile, uploads, msgs, pay, revs, remPay] = await Promise.all([
                    getProfile(comm.artist_id).catch(() => null),
                    getProfile(comm.buyer_id).catch(() => null),
                    getWorkUploads(id).catch(() => []),
                    getMessages(id).catch(() => []),
                    getAdvancePayment(id).catch(() => null),
                    getRevisions(id).catch(() => []),
                    getRemainingPayment(id).catch(() => null)
                ]);

                setArtist(artistProfile);
                setBuyer(buyerProfile);
                setWorkUploads(uploads || []);
                setMessages(msgs || []);
                setPayment(pay);
                setRevisions(revs || []);
                setRemainingPayment(remPay);

                await markMessagesRead(id, loggedUser.id);
        } catch {
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
        } catch {
            toast.error("Failed to send message");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                toast.error("File size must be less than 100MB");
                return;
            }
            setUploadFile(file);
        }
    };

    const handleUploadWork = async () => {
        if (!uploadFile) {
            toast.error("Please select an image");
            return;
        }

        setIsUploading(true);
        try {
            const watermarkedUrl = await createWatermarkedImage(uploadFile);
            const cleanUrl = await uploadImage(uploadFile);
            
            const uploadData = {
                upload_id: `upload_${Date.now()}`,
                commission_id: id,
                image_url: watermarkedUrl,
                clean_image_url: cleanUrl,
                watermarked: true,
                is_final: false,
                notes: uploadNotes
            };

            await uploadWork(uploadData);
            
            const uploads = await getWorkUploads(id).catch(() => []);
            setWorkUploads(uploads || []);
            
            setUploadFile(null);
            setUploadNotes("");
            toast.success("Preview uploaded! Buyer needs to approve for final version.");
            
            const updated = await getCommission(id);
            setCommission(updated);
        } catch (e) {
            toast.error(e.message || "Failed to upload work");
        } finally {
            setIsUploading(false);
        }
    };

    const createWatermarkedImage = async (file) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const fontSize = Math.max(img.width / 10, 40);
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                ctx.save();
                ctx.translate(img.width / 2, img.height / 2);
                ctx.rotate(-Math.PI / 4);
                ctx.fillText('PREVIEW', 0, 0);
                ctx.fillText('PREVIEW', 0, fontSize * 1.5);
                ctx.fillText('PREVIEW', 0, -fontSize * 1.5);
                ctx.restore();
                
                canvas.toBlob(async (blob) => {
                    URL.revokeObjectURL(url);
                    try {
                        const watermarkedFile = new File([blob], file.name, { type: 'image/jpeg' });
                        const imageUrl = await uploadImage(watermarkedFile);
                        resolve(imageUrl);
                    } catch (err) {
                        reject(err);
                    }
                }, 'image/jpeg', 0.9);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    };

    const handleCreatePayment = () => {
        setPaymentAction('create');
        setShowPaymentModal(true);
    };

    const handlePayAdvance = () => {
        setPaymentAction('advance');
        setShowPaymentModal(true);
    };

    const handleFinalUpload = async () => {
        if (!finalUploadFile) {
            toast.error("Please select an image");
            return;
        }

        setIsUploading(true);
        try {
            const imageUrl = await uploadImage(finalUploadFile);
            
            const uploadData = {
                upload_id: `final_${Date.now()}`,
                commission_id: id,
                image_url: imageUrl,
                watermarked: false,
                is_final: true,
                notes: "Final version"
            };

            await uploadWork(uploadData);
            
            const uploads = await getWorkUploads(id).catch(() => []);
            setWorkUploads(uploads || []);
            
            setFinalUploadFile(null);
            toast.success("Final version uploaded!");
            
            const updated = await getCommission(id);
            setCommission(updated);
        } catch (e) {
            toast.error(e.message || "Failed to upload final version");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFinalFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 100 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error("File size must be less than 100MB");
                return;
            }
            setFinalUploadFile(file);
        }
    };

    const handleDownload = async (imageUrl, filename) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            window.open(imageUrl, '_blank');
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            if (paymentAction === 'create' || paymentAction === 'advance') {
                if (!payment) {
                    const advanceAmount = commission.price * 0.5;
                    const paymentData = {
                        payment_id: `pay_${Date.now()}`,
                        commission_id: id,
                        amount: advanceAmount,
                        payment_intent: `pi_${Date.now()}`
                    };
                    await createAdvancePayment(paymentData);
                }
                await markPaymentPaid(id);
                toast.success("Advance payment successful!");
            } else if (paymentAction === 'remaining' || paymentAction === 'remaining_approve') {
                if (!remainingPayment) {
                    const remainingAmount = commission.price * 0.5;
                    const paymentData = {
                        payment_id: `rem_${Date.now()}`,
                        commission_id: id,
                        amount: remainingAmount,
                        payment_intent: `pi_${Date.now()}`
                    };
                    await createRemainingPayment(paymentData);
                }
                await markRemainingPaymentPaid(id);
                toast.success("Remaining payment successful!");
                
                if (paymentAction === 'remaining_approve') {
                    await approveWork(id);
                    setCommission({ ...commission, status: "completed" });
                    toast.success("Work approved! Final version now available.");
                }
            }
            
            const updated = await getCommission(id);
            setCommission(updated);
            const pay = await getAdvancePayment(id).catch(() => null);
            const remPay = await getRemainingPayment(id).catch(() => null);
            setPayment(pay);
            setRemainingPayment(remPay);
        } catch {
            toast.error("Failed to process payment");
        }
        setShowPaymentModal(false);
        setPaymentAction(null);
    };

    const handleReleasePayment = async () => {
        try {
            await releasePayment(id);
            toast.success("Payment released to artist!");
            
            const pay = await getAdvancePayment(id).catch(() => null);
            setPayment(pay);
        } catch {
            toast.error("Failed to release payment");
        }
    };

    const handleRequestRevision = async () => {
        if (!revisionNotes.trim()) {
            toast.error("Please add revision notes");
            return;
        }

        const lastUpload = workUploads[0];
        if (!lastUpload) {
            toast.error("No work to request revision for");
            return;
        }

        try {
            const revisionData = {
                revision_id: `rev_${Date.now()}`,
                commission_id: id,
                work_upload_id: lastUpload.id,
                request_notes: revisionNotes
            };
            await requestRevision(revisionData);
            toast.success("Revision requested!");
            setRevisionNotes("");
            
            const updated = await getCommission(id);
            setCommission(updated);
            
            const revs = await getRevisions(id).catch(() => []);
            setRevisions(revs || []);
        } catch {
            toast.error("Failed to request revision");
        }
    };

    const handleAccept = async () => {
        try {
            await acceptCommission(id);
            
            const updated = await getCommission(id);
            setCommission(updated);
            
            toast.success("Commission accepted!");
        } catch {
            toast.error("Failed to accept");
        }
    };

    const handleStart = async () => {
        try {
            await startCommission(id);
            setCommission({ ...commission, status: "in_progress" });
            toast.success("Commission started!");
        } catch {
            toast.error("Failed to start");
        }
    };

    const handleSubmitForReview = async () => {
        try {
            await submitForReview(id);
            setCommission({ ...commission, status: "review" });
            toast.success("Submitted for review!");
        } catch {
            toast.error("Failed to submit");
        }
    };

    const handleApprove = async () => {
        if (!isAdvancePaid && isBuyer) {
            setPaymentAction('advance');
            setShowPaymentModal(true);
            return;
        }

        if (!isRemainingPaid && isBuyer) {
            setPaymentAction('remaining_approve');
            setShowPaymentModal(true);
            return;
        }

        try {
            await approveWork(id);
            setCommission({ ...commission, status: "completed" });
            toast.success("Work approved! Final version now available.");
        } catch {
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
    const advanceAmount = commission?.price * 0.5;
    const isAdvancePaid = payment?.status === "paid";
    const isRemainingPaid = remainingPayment?.status === "paid";
    const hasUploadedWork = workUploads.length > 0;
    const isApproved = commission?.status === "completed";
    const lastRevision = revisions[0];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Full Screen Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-4 right-4 text-white p-2" onClick={() => setSelectedImage(null)}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {/* Watermark overlay for preview images */}
                    {!isApproved && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-white/20 text-9xl font-black rotate-45">PREVIEW</span>
                        </div>
                    )}
                    <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain" />
                </div>
            )}

            <Link to="/commissions" className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-block">
                ← Back to commissions
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                {isArtist ? (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                                        {buyer?.avatar_url ? (
                                            <img src={buyer.avatar_url} alt="Buyer" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-yellow-500">
                                                {buyer?.full_name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                                        {artist?.avatar_url ? (
                                            <img src={artist.avatar_url} alt="Artist" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-yellow-500">
                                                {artist?.full_name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-xl font-black text-slate-900">{commission.title}</h1>
                                    <p className="text-sm text-slate-500">
                                        {isArtist ? `From: ${buyer?.full_name || 'Buyer'}` : `Artist: ${artist?.full_name || 'Artist'}`}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={commission.status} />
                        </div>
                        <p className="text-slate-600 mb-4">{commission.description}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500">Total Budget</p>
                                <p className="text-xl font-bold text-slate-900">${commission.price}</p>
                            </div>
                            {commission.deadline && (
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Deadline</p>
                                    <p className="font-bold text-slate-900">
                                        {new Date(commission.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {/* Buyer: Waiting for artist to accept */}
                            {commission.status === "pending" && isBuyer && payment && payment.status === "paid" && (
                                <span className="text-blue-600 font-medium">Waiting for artist to accept...</span>
                            )}
                            
                            {/* Artist: Accept when paid */}
                            {commission.status === "pending" && isArtist && payment && payment.status === "paid" && (
                                <Button onClick={handleAccept}>Accept Commission</Button>
                            )}
                            
                            {/* Artist: Start when accepted */}
                            {commission.status === "accepted" && isArtist && (
                                <Button onClick={handleStart}>Start Work</Button>
                            )}
                            
                            {/* Artist: Submit for review */}
                            {commission.status === "in_progress" && isArtist && (
                                <Button onClick={handleSubmitForReview} disabled={!hasUploadedWork}>
                                    Submit for Review {!hasUploadedWork && "(Upload preview first)"}
                                </Button>
                            )}
                            
                            {/* Buyer: Review or Revision */}
                            {(commission.status === "review" || commission.status === "revised") && isBuyer && (
                                <>
                                    <Button onClick={handleApprove}>
                                        {!isAdvancePaid ? `Pay Advance ($${advanceAmount})` : !isRemainingPaid ? `Approve & Pay Remaining ($${advanceAmount})` : "Approve Work"}
                                    </Button>
                                    <Button variant="outline" onClick={handleRequestRevision} disabled={!revisionNotes.trim()}>
                                        Request Revision
                                    </Button>
                                </>
                            )}
                            
                            {commission.status === "completed" && (
                                <span className="text-green-600 font-bold">✓ Commission Complete!</span>
                            )}
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment</h2>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-900">Advance (50%)</p>
                                    <p className="text-sm text-slate-500">${advanceAmount}</p>
                                </div>
                                <PaymentStatusBadge status={payment?.status} />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-900">Remaining (50%)</p>
                                    <p className="text-sm text-slate-500">${advanceAmount}</p>
                                </div>
                                {isRemainingPaid ? (
                                    <span className="text-green-600 font-bold text-sm">Paid</span>
                                ) : (
                                    <span className="text-slate-400 text-sm">Pending</span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {commission.status === "pending" && isBuyer && payment && payment.status !== "paid" && (
                                <Button onClick={handleCreatePayment} size="sm">
                                    Pay Advance (${advanceAmount})
                                </Button>
                            )}
                            
                            {(commission.status === "accepted" || commission.status === "in_progress") && isBuyer && payment && payment.status !== "paid" && (
                                <Button onClick={handlePayAdvance} size="sm">
                                    Pay Advance (${advanceAmount})
                                </Button>
                            )}
                            
                            {isArtist && payment?.status === "paid" && remainingPayment?.status === "paid" && (
                                <Button onClick={handleReleasePayment} size="sm">
                                    Release Payment
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Work Upload Section */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Work Uploads</h2>
                        
                        {/* Revision Notes from Buyer */}
                        {(commission.status === "revised" || commission.status === "review") && lastRevision && (
                            <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <p className="font-bold text-orange-800">Revision Requested:</p>
                                <p className="text-sm text-orange-700 mt-1">{lastRevision.request_notes}</p>
                            </div>
                        )}

                        {/* Upload for Artist */}
                        {isArtist && (commission.status === "accepted" || commission.status === "in_progress" || commission.status === "revised") && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                <p className="text-sm font-medium text-slate-700 mb-3">Upload a preview (will be watermarked)</p>
                                <label className="block cursor-pointer">
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
                                        {uploadFile ? (
                                            <div className="flex flex-col items-center">
                                                <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <p className="text-sm font-medium text-slate-700">{uploadFile.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm font-medium text-slate-700">Click to upload</p>
                                                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 100MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>

                                <textarea
                                    value={uploadNotes}
                                    onChange={(e) => setUploadNotes(e.target.value)}
                                    placeholder="Notes about this preview..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mt-3"
                                    rows={2}
                                />
                                <Button 
                                    onClick={handleUploadWork} 
                                    disabled={!uploadFile || isUploading}
                                    className="w-full mt-3"
                                >
                                    {isUploading ? "Uploading..." : "Upload Preview"}
                                </Button>
                            </div>
                        )}

                        {/* Show Uploads */}
                        {workUploads.length === 0 ? (
                            <p className="text-slate-500 text-sm">No work uploaded yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {workUploads.map((upload) => (
                                    <div key={upload.id}>
                                        {/* Image Card */}
                                        <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(upload.image_url)}>
                                            <img src={upload.image_url} alt="Work" className="w-full h-full object-cover" />
                                            
                                            {/* Show watermark on preview images only */}
                                            {!upload.is_final && !upload.watermarked && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-white/40 text-4xl font-black rotate-45">PREVIEW</span>
                                                </div>
                                            )}
                                            
                                            {/* Status badge */}
                                            <div className="absolute top-2 right-2">
                                                {upload.is_final ? (
                                                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                                        Final
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                                        Preview
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                {upload.is_final ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url = upload.clean_image_url || upload.image_url;
                                                            handleDownload(url, `commission-${id}-final.jpg`);
                                                        }}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download Full
                                                    </button>
                                                ) : upload.clean_image_url ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(upload.clean_image_url, `commission-${id}-preview.jpg`);
                                                        }}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </button>
                                                ) : isApproved ? (
                                                    <span className="text-yellow-500 font-medium">Waiting for final version</span>
                                                ) : (
                                                    <span className="text-white font-medium">Click to view</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Artist's Message - Separate Card */}
                                        {upload.notes && (
                                            <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-yellow-50 rounded-xl border border-slate-200">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-bold text-slate-900">{artist?.full_name?.charAt(0) || "A"}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Message from {artist?.full_name || "Artist"}</p>
                                                        <p className="text-sm text-slate-700 mt-1">{upload.notes}</p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {new Date(upload.created_at).toLocaleDateString()} at {new Date(upload.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isApproved && (
                            <>
                                <p className="text-green-600 text-sm mt-3 font-medium">✓ Final version approved - You can view and download in full resolution</p>
                                
                                {isArtist && (
                                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                                        <p className="text-sm font-medium text-green-800 mb-3">Upload Final Version (without watermark)</p>
                                        <label className="block cursor-pointer">
                                            <div className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center hover:border-green-500 hover:bg-green-100 transition-colors">
                                                {finalUploadFile ? (
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <p className="text-sm font-medium text-slate-700">{finalUploadFile.name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-8 h-8 text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-sm font-medium text-slate-700">Click to upload clean final</p>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFinalFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <Button 
                                            onClick={handleFinalUpload} 
                                            disabled={!finalUploadFile || isUploading}
                                            className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                        >
                                            {isUploading ? "Uploading..." : "Upload Final Version"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Revision Notes Section */}
                    {isBuyer && (commission.status === "review" || commission.status === "revised") && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Request Revision</h2>
                            <textarea
                                value={revisionNotes}
                                onChange={(e) => setRevisionNotes(e.target.value)}
                                placeholder="Describe what changes you want..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-yellow-500 outline-none"
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Chat</h2>
                        <div className="h-80 overflow-y-auto space-y-3 mb-4">
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

            <PaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => {
                    setShowPaymentModal(false);
                    setPaymentAction(null);
                }}
                amount={advanceAmount}
                paymentType={paymentAction === 'remaining' || paymentAction === 'remaining_approve' ? 'remaining' : 'advance'}
                onSuccess={handlePaymentSuccess}
                onFailure={() => toast.error('Payment failed')}
            />
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

function PaymentStatusBadge({ status }) {
    if (!status) {
        return <span className="text-orange-500 text-sm font-bold">Required</span>;
    }
    
    const styles = {
        pending: "bg-orange-100 text-orange-600",
        paid: "bg-green-50 text-green-600",
        released: "bg-blue-50 text-blue-600",
        refunded: "bg-red-50 text-red-600",
        failed: "bg-red-50 text-red-600"
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || styles.pending}`}>
            {status.toUpperCase()}
        </span>
    );
}

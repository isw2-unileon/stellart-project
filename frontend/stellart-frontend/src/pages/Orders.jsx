import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
    getOrders, 
    shipOrder, 
    deliverOrder, 
    getArtwork, 
    getAddresses,
    getLoggedUser 
} from "../service/apiService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Package, Truck, CheckCircle, MapPin } from "lucide-react";

export default function Orders() {
    const [view, setView] = useState("buyer");
    const [buyerOrders, setBuyerOrders] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [enrichedData, setEnrichedData] = useState({});
    const [trackingCodes, setTrackingCodes] = useState({});
    const [carriers, setCarriers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const user = await getLoggedUser();
            if (!user) navigate("/login");
        };
        checkUser();
        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const [bOrders, sOrders] = await Promise.all([
                getOrders("buyer").catch(() => []),
                getOrders("seller").catch(() => [])
            ]);

            const buyerList = bOrders || [];
            const sellerList = sOrders || [];

            setBuyerOrders(buyerList);
            setSellerOrders(sellerList);

            const extraData = {};
            const allOrders = [...buyerList, ...sellerList];

            await Promise.all(allOrders.map(async (order) => {
                try {
                    const [artwork, addresses] = await Promise.all([
                        getArtwork(order.artwork_id).catch(() => null),
                        getAddresses(order.buyer_id).catch(() => [])
                    ]);
                    
                    const address = addresses.find(a => (a.id === order.shipping_address_id));
                    
                    const street = address?.street || "";
                    const city = address?.city || "";
                    const postalCode = address?.postal_code || "";
                    const country = address?.country || "";
                    
                    extraData[order.id] = {
                        artworkTitle: artwork?.title || "Untitled Artwork",
                        artworkImage: artwork?.image_url,
                        addressFull: address 
                            ? `${street}\n${postalCode} ${city}\n${country}` 
                            : "Address details not available"
                    };
                } catch (e) {
                    console.error("Enrichment error:", e);
                }
            }));
            setEnrichedData(extraData);
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleShip = async (orderId) => {
        const code = trackingCodes[orderId];
        const carrier = carriers[orderId];
        if (!code || !carrier) {
            toast.error("Please provide tracking code and carrier");
            return;
        }
        try {
            await shipOrder(orderId, code, carrier);
            toast.success("Order marked as shipped!");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeliver = async (orderId) => {
        try {
            await deliverOrder(orderId);
            toast.success("Order confirmed as delivered!");
            fetchOrders(); 
        } catch (error) {
            toast.error("Failed to confirm delivery");
        }
    };

    const activeBuyerOrders = buyerOrders.filter(order => order.status !== "delivered");
    const activeSellerOrders = sellerOrders.filter(order => order.status !== "delivered");
    
    const displayOrders = view === "buyer" ? activeBuyerOrders : activeSellerOrders;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Orders</h1>
                    <p className="text-slate-500 mt-1">Manage your activity</p>
                </div>
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
                <button
                    onClick={() => setView("buyer")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        view === "buyer" 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    Purchases ({activeBuyerOrders.length})
                </button>
                <button
                    onClick={() => setView("seller")}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        view === "seller" 
                            ? "bg-white text-slate-900 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    Sales ({activeSellerOrders.length})
                </button>
            </div>

            <div className="space-y-6">
                {displayOrders.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-3xl">
                        <p className="text-slate-500">
                            You haven't {view === "buyer" ? "purchased" : "sold"} anything yet.
                        </p>
                        <Link to={view === "buyer" ? "/explore" : "/profile"} className="text-yellow-500 font-bold hover:underline">
                            {view === "buyer" ? "Find art to buy" : "Share your art with the world"}
                        </Link>
                    </div>
                ) : (
                    displayOrders.map(order => {
                        const info = enrichedData[order.id] || {};
                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row min-h-60">
                                    <Link to={`/artwork-details/${order.artwork_id}`} className="w-full md:w-64 relative block shrink-0">
                                        {info.artworkImage ? (
                                            <img src={info.artworkImage} alt={info.artworkTitle} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 min-h-48">
                                                <Package size={48} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </Link>

                                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                            <div className="space-y-4 flex-1">
                                                <div className="text-left">
                                                    <Link to={`/artwork-details/${order.artwork_id}`}>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight hover:text-yellow-500 transition-colors">
                                                            {info.artworkTitle}
                                                        </h2>
                                                    </Link>
                                                    {order.carrier && (
                                                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">
                                                            VIA {order.carrier}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 w-fit max-w-md">
                                                    <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping to</p>
                                                        <p className="text-sm text-slate-700 font-bold leading-relaxed whitespace-pre-line">
                                                            {info.addressFull}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-linear-to-br from-yellow-50 to-white px-5 py-3 rounded-xl text-center border border-yellow-200/60 shadow-sm shrink-0">
                                                <p className="text-[10px] font-black text-yellow-600/70 uppercase tracking-widest mb-1">Total</p>
                                                <p className="text-xl font-black text-yellow-500">${order.amount}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                            <div className="w-full sm:w-auto text-left">
                                                {order.tracking_code ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                            <Truck className="w-4 h-4 text-blue-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Number</p>
                                                            <p className="font-mono font-bold text-sm text-slate-900">{order.tracking_code}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 text-xs font-bold flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-slate-200 animate-pulse" />
                                                        Awaiting shipment
                                                    </p>
                                                )}
                                            </div>

                                            <div className="w-full sm:w-auto">
                                                {view === "seller" && order.status === "pending" && (
                                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                                                        <div className="flex bg-white rounded-lg border border-slate-100 overflow-hidden divide-x divide-slate-50">
                                                            <div className="flex flex-col p-1.5">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase px-1">Carrier</span>
                                                                <Input 
                                                                    placeholder="DHL..." 
                                                                    value={carriers[order.id] || ""}
                                                                    onChange={(e) => setCarriers({...carriers, [order.id]: e.target.value})}
                                                                    className="h-6 border-none bg-transparent shadow-none w-20 text-[10px] font-bold py-0 focus-visible:ring-0"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col p-1.5">
                                                                <span className="text-[8px] font-black text-slate-400 uppercase px-1">Tracking</span>
                                                                <Input 
                                                                    placeholder="Code #..." 
                                                                    value={trackingCodes[order.id] || ""}
                                                                    onChange={(e) => setTrackingCodes({...trackingCodes, [order.id]: e.target.value})}
                                                                    className="h-6 border-none bg-transparent shadow-none w-28 text-[10px] font-bold py-0 focus-visible:ring-0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button onClick={() => handleShip(order.id)} className="bg-slate-900 text-white hover:bg-yellow-400 hover:text-slate-900 h-10 px-5 rounded-lg text-xs font-bold transition-all">
                                                            Ship
                                                        </Button>
                                                    </div>
                                                )}

                                                {view === "buyer" && order.status === "shipped" && (
                                                    <Button onClick={() => handleDeliver(order.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 h-10 rounded-lg text-sm flex gap-2 items-center shadow-sm transition-transform active:scale-95">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirm Delivery
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-slate-100 text-slate-600",
        shipped: "bg-blue-50 text-blue-600",
        delivered: "bg-green-50 text-green-600",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
}
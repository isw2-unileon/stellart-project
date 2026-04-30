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
import { Package, Truck, CheckCircle, MapPin, Search } from "lucide-react";

export default function Orders() {
    const [view, setView] = useState("buyer");
    const [orders, setOrders] = useState([]);
    const [enrichedData, setEnrichedData] = useState({});
    const [trackingCodes, setTrackingCodes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const user = await getLoggedUser();
            if (!user) navigate("/login");
        };
        checkUser();
        fetchOrders();
    }, [view, navigate]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await getOrders(view);
            const ordersList = data || [];
            setOrders(ordersList);

            // Cargar títulos, imágenes y direcciones para cada pedido
            const extraData = {};
            await Promise.all(ordersList.map(async (order) => {
                try {
                    const [artwork, addresses] = await Promise.all([
                        getArtwork(order.artwork_id).catch(() => null),
                        getAddresses(order.buyer_id).catch(() => [])
                    ]);
                    
                    const address = addresses.find(a => (a.ID || a.id) === order.shipping_address_id);
                    
                    extraData[order.id] = {
                        artworkTitle: artwork?.title || "Untitled Artwork",
                        artworkImage: artwork?.image_url,
                        addressFull: address ? `${address.Street || address.street}, ${address.City || address.city}` : "Address not available"
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
        if (!code) {
            toast.error("Please provide a tracking code");
            return;
        }
        try {
            await shipOrder(orderId, code);
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

    // Filtrar para mostrar solo pedidos activos en la vista principal
    const activeOrders = orders.filter(order => order.status !== "delivered");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                {/* Header de la sección */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Package className="w-10 h-10 text-yellow-500" />
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900">Order Center</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Track your art purchases and sales in real-time.</p>
                    </div>

                    <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl w-fit h-fit shadow-inner">
                        <button
                            onClick={() => setView("buyer")}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                                view === "buyer" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            My Purchases
                        </button>
                        <button
                            onClick={() => setView("seller")}
                            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${
                                view === "seller" ? "bg-white text-slate-900 shadow-md" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            My Sales
                        </button>
                    </div>
                </div>

                {/* Listado de pedidos */}
                <div className="space-y-6">
                    {activeOrders.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No active orders</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">You don't have any pending orders in this section at the moment.</p>
                        </div>
                    ) : (
                        activeOrders.map(order => {
                            const info = enrichedData[order.id] || {};
                            return (
                                <div key={order.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all overflow-hidden">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Imagen y Estado */}
                                        <div className="w-full lg:w-64 h-64 lg:h-auto bg-slate-100 relative shrink-0">
                                            {info.artworkImage ? (
                                                <img src={info.artworkImage} alt={info.artworkTitle} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                    <Package size={48} strokeWidth={1} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <StatusBadge status={order.status} />
                                            </div>
                                        </div>

                                        {/* Contenido principal */}
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                                                            {info.artworkTitle}
                                                        </h2>
                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-300 uppercase tracking-widest">
                                                            <span>ID: {order.id.slice(0, 8)}</span>
                                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                        <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shipping Destination</p>
                                                            <p className="text-sm text-slate-700 font-bold leading-tight">{info.addressFull}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-yellow-50 px-6 py-4 rounded-2xl text-right self-start md:self-auto border border-yellow-100">
                                                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1">Total Amount</p>
                                                    <p className="text-3xl font-black text-slate-900">${order.amount}</p>
                                                </div>
                                            </div>

                                            {/* Footer de la tarjeta: Acciones */}
                                            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="w-full sm:w-auto">
                                                    {order.tracking_code ? (
                                                        <div className="flex items-center gap-3 text-blue-600">
                                                            <Truck className="w-5 h-5" />
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tracking Code</p>
                                                                <p className="font-mono font-bold text-sm">{order.tracking_code}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-300 italic text-sm">
                                                            <div className="w-2 h-2 bg-slate-200 rounded-full animate-pulse" />
                                                            Awaiting shipment details
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="w-full sm:w-auto flex gap-3">
                                                    {view === "seller" && order.status === "pending" && (
                                                        <div className="flex items-center gap-2 w-full bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                            <Input 
                                                                placeholder="Enter tracking ID..." 
                                                                value={trackingCodes[order.id] || ""}
                                                                onChange={(e) => setTrackingCodes({...trackingCodes, [order.id]: e.target.value})}
                                                                className="h-12 border-none bg-transparent shadow-none focus-visible:ring-0 w-48 font-bold"
                                                            />
                                                            <Button 
                                                                onClick={() => handleShip(order.id)} 
                                                                className="bg-slate-900 text-white hover:bg-yellow-500 hover:text-slate-900 px-8 h-12 rounded-xl font-black transition-all"
                                                            >
                                                                SHIP NOW
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {view === "buyer" && order.status === "shipped" && (
                                                        <Button 
                                                            onClick={() => handleDeliver(order.id)} 
                                                            className="bg-green-500 hover:bg-green-600 text-white font-black px-10 py-7 rounded-2xl shadow-xl shadow-green-100 flex gap-2 items-center"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                            CONFIRM DELIVERY
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
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-yellow-400 text-slate-900",
        shipped: "bg-blue-500 text-white",
        delivered: "bg-green-500 text-white",
    };
    
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 ${styles[status] || styles.pending}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            {status}
        </span>
    );
}
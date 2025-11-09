"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChefHat, 
  Truck,
  Filter,
  Search,
  User,
  Mail,
  Calendar,
  IndianRupee
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string | null;
}

interface AdminOrder {
  id: number;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/admin/orders");
      return;
    }

    if (session?.user) {
      fetchOrders();
    }
  }, [session, isPending, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
      } else if (response.status === 403) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = orders;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toString().includes(searchTerm) ||
        (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "preparing":
        return <ChefHat className="w-5 h-5 text-orange-500" />;
      case "ready":
        return <Package className="w-5 h-5 text-green-500" />;
      case "out_for_delivery":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "ready":
        return "bg-green-100 text-green-800 border-green-300";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-200 text-green-900 border-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the order in the state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: data.order.status } : order
          )
        );
        toast.success(`Order #${orderId} status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Orders Dashboard</h1>
              <p className="text-purple-200">Manage all customer orders</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, user name, or email..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center">
              <p className="text-gray-600">
                Showing <span className="font-bold">{filteredOrders.length}</span> of{" "}
                <span className="font-bold">{orders.length}</span> orders
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Orders Found</h2>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "There are currently no orders in the system"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-gray-800">Order #{order.id}</h3>
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{order.userName || "Unknown User"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{order.userEmail || "No email"}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-600">{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h5 className="font-medium text-gray-800">{item.productName || "Unknown Product"}</h5>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₹{item.price * item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="p-6 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Update Order Status</h4>
                      <p className="text-sm text-gray-600">Select a new status for this order</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* Accept/Decline buttons for pending orders */}
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            disabled={updatingOrderId === order.id}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              updatingOrderId === order.id
                                ? "bg-gray-300 text-gray-500"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {updatingOrderId === order.id ? "Accepting..." : "Accept Order"}
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            disabled={updatingOrderId === order.id}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              updatingOrderId === order.id
                                ? "bg-gray-300 text-gray-500"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            {updatingOrderId === order.id ? "Declining..." : "Decline Order"}
                          </button>
                        </>
                      )}
                      
                      {/* Show all status options for other orders */}
                      {order.status !== "pending" && statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateOrderStatus(order.id, option.value)}
                          disabled={updatingOrderId === order.id || order.status === option.value}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            order.status === option.value
                              ? "bg-purple-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-purple-100"
                          } ${updatingOrderId === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {updatingOrderId === order.id && order.status !== option.value
                            ? "Updating..."
                            : option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
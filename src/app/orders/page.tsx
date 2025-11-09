"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, Bell, ChefHat, Truck, User } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  order_id: number;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string | null;
}

interface Order {
  id: number;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  phone: string;
  payment_method: string;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  estimated_delivery?: string;
  current_location?: string;
}

export default function OrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/orders");
      return;
    }

    if (session?.user) {
      fetchOrders();
      // Poll for order updates every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [session, isPending, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
        
        // Check for status changes and show notifications
        if (orders.length > 0) {
          data?.forEach((newOrder: Order) => {
            const oldOrder = orders.find(o => o.id === newOrder.id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              showOrderNotification(newOrder);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const showOrderNotification = (order: Order) => {
    const statusMessages: Record<string, string> = {
      confirmed: `✅ Order #${order.id} confirmed! Your food is being prepared.`,
      preparing: `👨‍🍳 Order #${order.id} is being prepared by our chefs!`,
      ready: `🎉 Order #${order.id} is ready for pickup/delivery!`,
      out_for_delivery: `🚚 Order #${order.id} is out for delivery!`,
      delivered: `✅ Order #${order.id} has been delivered! Enjoy your meal!`,
    };

    const message = statusMessages[order.status] || `Order #${order.id} status updated`;
    toast.success(message, {
      icon: "🔔",
      duration: 5000,
    });
  };

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

  const getEstimatedDeliveryTime = (order: Order) => {
    const createdAt = new Date(order.created_at);
    const estimatedTime = new Date(createdAt.getTime() + 30 * 60000); // 30 minutes
    return estimatedTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const getCurrentLocation = (status: string) => {
    const locations: Record<string, string> = {
      pending: "Order received at Madras Engineering College Canteen",
      confirmed: "Order confirmed - Kitchen Queue",
      preparing: "Kitchen - Being prepared by our chefs",
      ready: "Ready for pickup at Canteen Counter",
      out_for_delivery: "En route to your location",
      delivered: "Delivered successfully",
    };
    return locations[status] || "Madras Engineering College Canteen";
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your orders...</p>
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
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-purple-200">Track your delicious food orders</p>
            </div>
            <Bell className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-gray-600 text-lg mb-8">
              Start ordering delicious food from our menu!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition-all hover:shadow-xl hover:scale-105"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-200"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
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
                      <p className="text-gray-600">
                        Ordered on {new Date(order.created_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-3xl font-bold text-purple-600">₹{order.total_amount}</p>
                      <p className="text-sm text-gray-600">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Delivery Info */}
                <div className="bg-purple-50 p-6 border-b border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Current Location</h4>
                        <p className="text-gray-700">{getCurrentLocation(order.status)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">
                          {order.status === "delivered" ? "Delivered At" : "Estimated Delivery"}
                        </h4>
                        <p className="text-gray-700">
                          {order.status === "delivered"
                            ? new Date(order.updated_at).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : getEstimatedDeliveryTime(order)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                          🍽️
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-800 text-lg">{item.product_name}</h5>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-600">₹{item.price * item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Details */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">Delivery Details</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <span className="font-semibold">Address:</span> {order.delivery_address}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {order.phone}
                    </p>
                    {order.special_instructions && (
                      <p>
                        <span className="font-semibold">Special Instructions:</span>{" "}
                        {order.special_instructions}
                      </p>
                    )}
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

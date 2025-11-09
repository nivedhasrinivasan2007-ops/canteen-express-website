"use client";

import { useEffect, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, Smartphone, Banknote, MapPin, Phone, User, ShoppingBag, CheckCircle, Package, LogOut, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity: number;
}

interface CheckoutCart {
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CheckoutCart | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!isPending && !session?.user) {
      toast.error("Please login to checkout");
      router.push("/login?redirect=/checkout");
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("checkout_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        
        // Pre-fill delivery details with user info
        if (session?.user) {
          setDeliveryDetails(prev => ({
            ...prev,
            name: session.user.name || "",
          }));
        }
      } catch (error) {
        toast.error("Error loading cart");
        router.push("/menu");
      }
    } else {
      toast.error("Cart is empty");
      router.push("/menu");
    }
  }, [session, isPending, router]);

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay with cash when you receive your order",
      icon: Banknote,
      color: "bg-green-500",
    },
    {
      id: "upi",
      name: "UPI Payment",
      description: "Google Pay, PhonePe, Paytm, etc.",
      icon: Wallet,
      color: "bg-purple-500",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, RuPay",
      icon: CreditCard,
      color: "bg-blue-500",
    },
  ];

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Logged out successfully!");
      router.push("/");
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address) {
      toast.error("Please fill in all delivery details");
      return;
    }

    if (deliveryDetails.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsProcessing(true);

    try {
      // Place order through API
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      // Clear cart from localStorage
      localStorage.removeItem("checkout_cart");

      // Show success
      setOrderPlaced(true);
      toast.success("Order placed successfully! 🎉");

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50">
        <Loader2 className="w-8 h-8 text-[#ff4b2b] animate-spin" />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md mx-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your order.</p>
          <p className="text-gray-600 mb-6">Your delicious food is on its way!</p>
          <div className="bg-orange-50 p-4 rounded-xl mb-6">
            <p className="text-sm text-gray-700">
              <strong>Order Total:</strong> ₹{cart?.total}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Payment Method:</strong> {paymentMethods.find(m => m.id === selectedPayment)?.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Delivery To:</strong> {deliveryDetails.address}
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-[#ff4b2b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#ff3b1b] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cart is empty</h1>
          <Link
            href="/menu"
            className="inline-block bg-[#ff4b2b] text-white px-8 py-3 rounded-full font-bold hover:bg-[#ff3b1b] transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/menu"
              className="flex items-center gap-2 text-white hover:text-[#ffeb3b] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </Link>
            <div className="flex items-center gap-4">
              {session?.user && (
                <>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 text-white hover:text-[#ffeb3b] transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">My Orders</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">{session.user.name || session.user.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Checkout</h1>
          <p className="text-purple-200">Complete your order</p>
        </div>
      </header>

      {/* Checkout Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Delivery & Payment */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={deliveryDetails.name}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Address *</label>
                  <textarea
                    value={deliveryDetails.address}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                    placeholder="Room/Hostel block, floor, etc."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={deliveryDetails.notes}
                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, notes: e.target.value })}
                    placeholder="Any special requests or dietary requirements"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPayment === method.id
                        ? "border-[#ff4b2b] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${method.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id
                            ? "border-[#ff4b2b] bg-[#ff4b2b]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPayment === method.id && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-[#ff4b2b] font-bold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{cart.total}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (5%)</span>
                  <span>₹{Math.round(cart.total * 0.05)}</span>
                </div>
                <div className="pt-3 border-t-2 border-gray-200 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#ff4b2b]">₹{cart.total + Math.round(cart.total * 0.05)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full mt-6 bg-[#ff4b2b] text-white py-4 rounded-full font-bold text-lg hover:bg-[#ff3b1b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Madras Engineering College Canteen. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
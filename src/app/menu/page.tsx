"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Search, Mic, Filter, X, User, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dietaryFilter, setDietaryFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const menuItems = [
    {
      category: "Breakfast",
      items: [
        { 
          id: "idli", 
          name: "Idli", 
          price: 30, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-indian-idli-white-db16d840-20251109045258.jpg",
          description: "Fluffy steamed rice cakes", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "dosa", 
          name: "Masala Dosa", 
          price: 60, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-crispy-golden-mas-e7403e58-20251109045257.jpg",
          description: "Crispy rice crepe with potato filling", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "pongal", 
          name: "Pongal", 
          price: 40, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-traditional-ponga-ac2ae1fb-20251109045259.jpg",
          description: "Traditional rice and lentil comfort food", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "poori", 
          name: "Poori", 
          price: 50, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-golden-fried-poor-3ddbb94a-20251109045258.jpg",
          description: "Golden fried bread with curry", 
          dietary: "Veg",
          spicy: "Medium"
        },
        { 
          id: "idiyappam", 
          name: "Idiyappam", 
          price: 35, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-idiyappam-string--22a81694-20251109045257.jpg",
          description: "Delicate string hoppers", 
          dietary: "Veg",
          spicy: "No"
        },
      ],
    },
    {
      category: "Main Course",
      items: [
        { 
          id: "biryani", 
          name: "Chicken Biryani", 
          price: 120, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-aromatic-chicken--52ab5a0e-20251109045258.jpg",
          description: "Aromatic basmati rice with tender chicken", 
          dietary: "Non-Veg",
          spicy: "High"
        },
        { 
          id: "chicken65", 
          name: "Chicken 65", 
          price: 100, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-spicy-chicken-65--a8fe7641-20251109045258.jpg",
          description: "Spicy fried chicken bites", 
          dietary: "Non-Veg",
          spicy: "High"
        },
        { 
          id: "paneer", 
          name: "Paneer Butter Masala", 
          price: 100, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-paneer-butter-mas-5fb5a552-20251109045259.jpg",
          description: "Creamy paneer in rich tomato gravy", 
          dietary: "Veg",
          spicy: "Medium"
        },
        { 
          id: "chapathi", 
          name: "Chapathi", 
          price: 30, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-soft-whole-wheat--be880794-20251109045257.jpg",
          description: "Soft whole wheat flatbread", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "parota", 
          name: "Kerala Parota", 
          price: 40, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-layered-flaky-ker-57da54fc-20251109045258.jpg",
          description: "Layered crispy flatbread", 
          dietary: "Veg",
          spicy: "No"
        },
      ],
    },
    {
      category: "Beverages",
      items: [
        { 
          id: "coffee", 
          name: "Cold Coffee", 
          price: 50, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-cold-coffee-with--aeedea90-20251109045258.jpg",
          description: "Chilled coffee with ice cream", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "tea", 
          name: "Masala Tea", 
          price: 20, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-masala-chai-tea-i-1a462133-20251109045257.jpg",
          description: "Spiced Indian tea", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "juice", 
          name: "Fresh Juice", 
          price: 40, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-fresh-fruit-juice-b9910940-20251109045257.jpg",
          description: "Seasonal fruit juice", 
          dietary: "Veg",
          spicy: "No"
        },
        { 
          id: "lassi", 
          name: "Sweet Lassi", 
          price: 35, 
          image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/realistic-3d-render-of-sweet-lassi-yogur-d54e8830-20251109045257.jpg",
          description: "Creamy yogurt drink", 
          dietary: "Veg",
          spicy: "No"
        },
      ],
    },
  ];

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("🎤 Listening... Speak now!");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setSearchQuery(transcript);
        toast.success(`Heard: "${transcript}"`);
        
        // Check for add commands
        const addMatch = transcript.match(/add (\d+) (.+)/);
        if (addMatch) {
          const quantity = parseInt(addMatch[1]);
          const itemName = addMatch[2];
          const foundItem = menuItems.flatMap(section => section.items)
            .find(item => item.name.toLowerCase().includes(itemName));
          
          if (foundItem) {
            for (let i = 0; i < quantity; i++) {
              addToCart(foundItem.id);
            }
            toast.success(`Added ${quantity} ${foundItem.name} to cart!`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        toast.error("Voice recognition error. Please try again.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      (window as any).recognition = recognition;
    }
  }, []);

  const startVoiceRecognition = () => {
    if ((window as any).recognition) {
      (window as any).recognition.start();
    } else {
      toast.error("Voice recognition not supported in this browser");
    }
  };

  const addToCart = (itemId: string) => {
    if (!session?.user) {
      toast.error("Please login to add items to cart");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success("Item added to cart!");
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart({});
    toast.info("Cart cleared");
  };

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

  const handleCheckout = () => {
    if (!session?.user) {
      toast.error("Please login to checkout");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Store cart in localStorage for checkout page
    localStorage.setItem('checkout_cart', JSON.stringify({
      items: Object.entries(cart).map(([itemId, qty]) => {
        const item = menuItems.flatMap(section => section.items).find(i => i.id === itemId);
        return item ? { ...item, quantity: qty } : null;
      }).filter(Boolean),
      total: totalPrice
    }));
    
    router.push('/checkout');
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuItems.flatMap(section => section.items).find(i => i.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  // Filter items
  const filteredItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || section.category === selectedCategory;
      const matchesDietary = dietaryFilter === "All" || item.dietary === dietaryFilter;
      return matchesSearch && matchesCategory && matchesDietary;
    })
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#ff4b2b]/95 shadow-lg">
        <nav className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
            <span className="text-white font-semibold">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍴</span>
            <span className="text-white text-xl font-bold hidden md:inline">Menu</span>
          </div>
          <div className="flex items-center gap-4">
            {!isPending && !session?.user ? (
              <Link href="/login" className="text-white hover:text-[#ffeb3b] transition-colors font-medium">
                Login
              </Link>
            ) : session?.user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{session.user.name || session.user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-2 text-white hover:text-[#ffeb3b] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : null}
            <div className="relative cursor-pointer group">
              <ShoppingCart className="w-6 h-6 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ffeb3b] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Our Delicious <span className="text-[#ff4b2b]">Menu</span>
          </h1>
          <p className="text-gray-600 text-lg mb-6">Fresh, authentic, and made with love</p>

          {/* Search and Voice */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none"
                />
              </div>
              <button
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-[#ffeb3b] text-black hover:bg-[#ff4b2b] hover:text-white"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-full font-semibold bg-[#ffeb3b] text-black hover:bg-[#ff4b2b] hover:text-white transition-colors"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="max-w-2xl mx-auto mb-6 p-6 bg-white rounded-2xl shadow-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none"
                  >
                    <option>All</option>
                    <option>Breakfast</option>
                    <option>Main Course</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary</label>
                  <select
                    value={dietaryFilter}
                    onChange={(e) => setDietaryFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#ff4b2b] focus:outline-none"
                  >
                    <option>All</option>
                    <option>Veg</option>
                    <option>Non-Veg</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Voice Instructions */}
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Voice Commands:</strong> Say "Add 2 Biryani" or search by name!
            </p>
          </div>
        </div>

        {filteredItems.map((section, idx) => (
          <div key={idx} className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-[#ff4b2b] inline-block pb-2">
              {section.category}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative h-48 bg-gradient-to-br from-[#ff4b2b] to-[#ff6b4b] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold">
                      {item.dietary}
                    </div>
                    {item.spicy !== "No" && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        🌶️ {item.spicy}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#ff4b2b]">₹{item.price}</span>
                      <div className="flex items-center gap-2">
                        {cart[item.id] > 0 ? (
                          <>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="bg-gray-200 hover:bg-red-500 hover:text-white p-2 rounded-full transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="bg-[#ffeb3b] text-black rounded-full px-3 py-1 font-bold">
                              {cart[item.id]}
                            </span>
                          </>
                        ) : null}
                        <button
                          onClick={() => addToCart(item.id)}
                          className="flex items-center gap-2 bg-[#ffeb3b] text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#ff4b2b] hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No items found matching your search.</p>
          </div>
        )}
      </main>

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border-4 border-[#ff4b2b] z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Cart Summary</h3>
            <button
              onClick={clearCart}
              className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = menuItems.flatMap(section => section.items).find(i => i.id === itemId);
              if (!item) return null;
              return (
                <div key={itemId} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.name} x{qty}</span>
                  <span className="font-bold text-[#ff4b2b]">₹{item.price * qty}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t-2 border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-[#ff4b2b]">₹{totalPrice}</span>
            </div>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-[#ff4b2b] text-white py-3 rounded-full font-bold hover:bg-[#ff3b1b] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Madras Engineering College Canteen. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
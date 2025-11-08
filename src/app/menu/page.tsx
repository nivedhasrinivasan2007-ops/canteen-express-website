"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Plus } from "lucide-react";

export default function MenuPage() {
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const menuItems = [
    {
      category: "Breakfast",
      items: [
        { id: "idli", name: "Idli", price: 30, emoji: "🍚", description: "Fluffy steamed rice cakes" },
        { id: "dosa", name: "Masala Dosa", price: 60, emoji: "🥞", description: "Crispy rice crepe with potato filling" },
        { id: "pongal", name: "Pongal", price: 40, emoji: "🍲", description: "Traditional rice and lentil comfort food" },
        { id: "poori", name: "Poori", price: 50, emoji: "🥯", description: "Golden fried bread with curry" },
        { id: "idiyappam", name: "Idiyappam", price: 35, emoji: "🍝", description: "Delicate string hoppers" },
      ],
    },
    {
      category: "Main Course",
      items: [
        { id: "biryani", name: "Chicken Biryani", price: 120, emoji: "🍛", description: "Aromatic basmati rice with tender chicken" },
        { id: "chicken65", name: "Chicken 65", price: 100, emoji: "🍗", description: "Spicy fried chicken bites" },
        { id: "paneer", name: "Paneer Butter Masala", price: 100, emoji: "🧈", description: "Creamy paneer in rich tomato gravy" },
        { id: "chapathi", name: "Chapathi", price: 30, emoji: "🫓", description: "Soft whole wheat flatbread" },
        { id: "parota", name: "Kerala Parota", price: 40, emoji: "🥐", description: "Layered crispy flatbread" },
      ],
    },
    {
      category: "Beverages",
      items: [
        { id: "coffee", name: "Cold Coffee", price: 50, emoji: "☕", description: "Chilled coffee with ice cream" },
        { id: "tea", name: "Masala Tea", price: 20, emoji: "🫖", description: "Spiced Indian tea" },
        { id: "juice", name: "Fresh Juice", price: 40, emoji: "🧃", description: "Seasonal fruit juice" },
        { id: "lassi", name: "Sweet Lassi", price: 35, emoji: "🥛", description: "Creamy yogurt drink" },
      ],
    },
  ];

  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

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
            <span className="text-white text-xl font-bold">Menu</span>
          </div>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ffeb3b] text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {totalItems}
              </span>
            )}
          </div>
        </nav>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Our Delicious <span className="text-[#ff4b2b]">Menu</span>
          </h1>
          <p className="text-gray-600 text-lg">Fresh, authentic, and made with love</p>
        </div>

        {menuItems.map((section, idx) => (
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
                  <div className="bg-gradient-to-br from-[#ff4b2b] to-[#ff6b4b] h-40 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#ff4b2b]">₹{item.price}</span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="flex items-center gap-2 bg-[#ffeb3b] text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#ff4b2b] hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                        {cart[item.id] > 0 && (
                          <span className="bg-white text-black rounded-full px-2 py-0.5 text-xs">
                            {cart[item.id]}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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

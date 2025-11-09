"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Truck, Star, ChefHat, Sparkles, LogOut, User, Package } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Firebase imports
import { auth, signOut } from "@/lib/firebase";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  useEffect(() => {
    setIsVisible(true);
    console.log("Canteen Express Home Page Loaded ✅");
  }, []);

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Also sign out from better-auth
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem("bearer_token");
        refetch();
        toast.success("Logged out successfully!");
        router.push("/");
      }
    } catch (error) {
      console.error("Firebase logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Dishes shown in the "Customer Favorites" preview and sorted according to `sortOrder`
  const dishesList = [
    { 
      name: "Chicken Biryani", 
      price: "₹120", 
      priceNum: 120,
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/hyper-realistic-3d-render-of-golden-cris-b09f8cb7-20251109051513.jpg", 
      rating: 4.8 
    },
    { 
      name: "Paneer Butter Masala", 
      price: "₹100", 
      priceNum: 100,
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/hyper-realistic-3d-render-of-paneer-butt-8d730fc4-20251109051514.jpg", 
      rating: 4.7 
    },
    { 
      name: "Masala Dosa", 
      price: "₹60", 
      priceNum: 60,
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/hyper-realistic-3d-render-of-crispy-gold-d0698e73-20251109051513.jpg", 
      rating: 4.9 
    },
    { 
      name: "Cold Coffee", 
      price: "₹50", 
      priceNum: 50,
      image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/hyper-realistic-3d-render-of-cold-coffee-4fbff78b-20251109051513.jpg", 
      rating: 4.6 
    },
  ];

  const sortedDishes = (() => {
    const copy = [...dishesList];
    if (sortOrder === 'asc') return copy.sort((a, b) => a.priceNum - b.priceNum);
    if (sortOrder === 'desc') return copy.sort((a, b) => b.priceNum - a.priceNum);
    return copy;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
        <nav className="container mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍴</span>
            <span className="text-white text-2xl font-bold">Madras Engineering College Canteen</span>
          </div>
          <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-8 list-none">
            <li>
              <Link
                href="/"
                className="text-[#ffeb3b] no-underline font-semibold transition-all hover:text-[#ffeb3b] hover:scale-105"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/menu"
                className="text-white no-underline font-medium transition-all hover:text-[#ffeb3b] hover:scale-105"
              >
                Menu
              </Link>
            </li>
            {!isPending && !session?.user ? (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-white no-underline font-medium transition-all hover:text-[#ffeb3b] hover:scale-105"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="bg-[#ffeb3b] text-black px-5 py-2 rounded-full font-semibold transition-all hover:bg-white hover:shadow-lg hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 text-white no-underline font-medium transition-all hover:text-[#ffeb3b] hover:scale-105"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-white">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
                  </div>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full font-semibold transition-all hover:bg-white hover:text-purple-600 hover:shadow-lg hover:scale-105"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </>
            )}
            <li>
              <Link
                href="/contact"
                className="text-white no-underline font-medium transition-all hover:text-[#ffeb3b] hover:scale-105"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[85vh] md:h-[90vh] flex justify-center items-center text-center text-white overflow-hidden"
      >
        {/* Beautiful Food Image Grid Background */}
        <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/delicious-golden-crispy-masala-dosa-on-a-a428c463-20251108104159.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-100"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/fluffy-white-idli-steamed-rice-cakes-arr-e77e0381-20251108104155.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-200"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/traditional-south-indian-idiyappam-strin-503b506f-20251108104155.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-300"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/aromatic-chicken-biryani-in-a-traditiona-1bbf12bd-20251108104154.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-400"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/crispy-fried-chicken-65-pieces-garnished-e6daefb7-20251108104155.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-500"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/traditional-south-indian-pongal-in-a-bra-e323507e-20251108104348.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-150"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/golden-brown-crispy-poori-indian-fried-b-74ef3cf0-20251108104346.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-250"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/soft-fluffy-chapathi-indian-flatbread-st-6faef159-20251108104347.jpg')",
            }}
          />
          <div 
            className="relative h-full bg-cover bg-center animate-fade-in delay-350"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/layered-crispy-kerala-parota-paratha-on--2d4fd2e9-20251108104347.jpg')",
            }}
          />
          <div 
            className="hidden md:block relative h-full bg-cover bg-center animate-fade-in delay-450"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/delicious-golden-crispy-masala-dosa-on-a-a428c463-20251108104159.jpg')",
            }}
          />
          <div 
            className="hidden lg:block relative h-full bg-cover bg-center animate-fade-in delay-100"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/aromatic-chicken-biryani-in-a-traditiona-1bbf12bd-20251108104154.jpg')",
            }}
          />
          <div 
            className="hidden lg:block relative h-full bg-cover bg-center animate-fade-in delay-200"
            style={{
              backgroundImage: "url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/55d3abfa-9350-433f-b3c8-27edb23c04e8/generated_images/traditional-south-indian-pongal-in-a-bra-e323507e-20251108104348.jpg')",
            }}
          />
        </div>
        
        {/* Enhanced Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/40 to-black/75"></div>
        
        <div
          className={`relative z-10 max-w-4xl px-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#ffeb3b]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#ffeb3b]/30">
            <Sparkles className="w-4 h-4 text-[#ffeb3b]" />
            <span className="text-[#ffeb3b] text-sm font-medium">Fast Delivery • Fresh Food</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-[#ffeb3b] inline-block animate-pulse">Madras Engineering College Canteen</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Delicious meals, lightning-fast delivery — straight from your favorite canteen to your doorstep!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 bg-[#ffeb3b] text-black px-8 py-4 rounded-full no-underline font-bold text-lg transition-all hover:bg-white hover:shadow-2xl hover:scale-105"
            >
              🍔 Browse Menu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {!session?.user && (
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full no-underline font-semibold text-lg border-2 border-white/30 transition-all hover:bg-white/20 hover:border-white/50"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-purple-600">Madras Engineering College Canteen</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience the perfect blend of speed, quality, and convenience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your favorite meals delivered in under 30 minutes. Hot, fresh, and on time, every time.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-yellow-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-yellow-100">
              <div className="w-16 h-16 bg-[#ffeb3b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChefHat className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Quality Food</h3>
              <p className="text-gray-600 leading-relaxed">
                Prepared by expert chefs using fresh ingredients. Taste the difference in every bite.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Free Delivery</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy free delivery on all orders above ₹200. More savings, more deliciousness!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dishes Preview */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Customer <span className="text-purple-600">Favorites</span>
            </h2>
            <p className="text-gray-600 text-lg">Our most loved dishes that keep them coming back</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div />
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">Sort by price:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'none' | 'asc' | 'desc')}
                className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none"
              >
                <option value="none">Default</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedDishes.map((dish, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden"
              >
                <div 
                  className="h-48 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundImage: `url('${dish.image}')` }}
                />
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-[#ffeb3b] text-[#ffeb3b]" />
                    <span className="text-sm font-semibold text-gray-700">{dish.rating}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{dish.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-600">{dish.price}</span>
                    <button className="bg-[#ffeb3b] text-black px-4 py-2 rounded-full font-semibold text-sm hover:bg-purple-600 hover:text-white transition-colors">
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition-all hover:shadow-xl hover:scale-105"
            >
              View Full Menu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              What Our <span className="text-purple-600">Customers Say</span>
            </h2>
            <p className="text-gray-600 text-lg">Real reviews from real food lovers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                review: "Best food delivery service! Always on time and the food is absolutely delicious. Highly recommended!",
                rating: 5,
              },
              {
                name: "Rahul Verma",
                review: "The biryani here is to die for! Quick delivery and amazing taste. My go-to place for lunch.",
                rating: 5,
              },
              {
                name: "Anita Desai",
                review: "Love the variety and quality. The staff is friendly and the app is so easy to use. 5 stars!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-purple-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ffeb3b] text-[#ffeb3b]" />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6 leading-relaxed">"{testimonial.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Order Your Favorite Meal?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of happy customers enjoying delicious food delivered fast!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffeb3b] hover:text-black transition-all hover:shadow-2xl hover:scale-105"
            >
              Order Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white hover:bg-white hover:text-purple-600 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🍴</span>
                <span className="text-2xl font-bold">Madras Engineering College Canteen</span>
              </div>
              <p className="text-gray-400">
                Delicious food delivered fast, right to your doorstep.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">Home</Link></li>
                <li><Link href="/menu" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">Menu</Link></li>
                <li><Link href="/orders" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">My Orders</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Account</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">Login</Link></li>
                <li><Link href="/signup" className="text-gray-400 hover:text-[#ffeb3b] transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📞 +91 98765 43210</li>
                <li>📧 info@canteenexpress.com</li>
                <li>📍 Mumbai, India</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Madras Engineering College Canteen. All Rights Reserved. Made with ❤️ for food lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
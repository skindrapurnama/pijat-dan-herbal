import React, { useState, useEffect, useRef } from "react";
import { 
  Leaf, Calendar, MessageSquare, ShoppingBag, User, Clock, Sparkles, 
  Plus, Minus, Trash2, Info, Phone, ShieldCheck, Check, 
  ChevronRight, AlertCircle, MapPin, Activity, X, Send, Award, ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { products, therapies, therapists } from "./data";
import { Product, Therapy, Therapist, CartItem, Booking, ChatMessage } from "./types";

export default function App() {
  // Navigation & Cart States
  const [activeTab, setActiveTab] = useState<"terapi" | "toko" | "konsultasi" | "pesanan">("terapi");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Storage states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Product Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Booking Flow States
  const [bookingTherapy, setBookingTherapy] = useState<Therapy | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingForm, setBookingForm] = useState({
    therapistId: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    notes: "",
    gender: "L" as "L" | "P" // Patient's gender to match therapist standard
  });

  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Checkout Form States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    shipping: "express", // express | ambil
    payment: "transfer" // transfer | cod
  });

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load from LocalStorage
  useEffect(() => {
    const savedBookings = localStorage.getItem("bookings_syifa");
    if (savedBookings) setBookings(JSON.parse(savedBookings));

    const savedOrders = localStorage.getItem("orders_syifa");
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedCart = localStorage.getItem("cart_syifa");
    if (savedCart) setCart(JSON.parse(savedCart));

    // Initial AI welcome message
    setChatMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Assalamu'alaikum Kak! Selamat datang di Konsultan Kesehatan AI Asy-Syifa. 🌿\n\nSaya adalah ahli herbalis dan terapis digital Anda. Silakan sampaikan keluhan kesehatan yang sedang dirasakan (misal: pusing migrain, batuk pilek, sesak napas, sinus gatal, letih lesu, atau gangguan pencernaan), dan saya akan meramu saran herba serta terapi fisik terbaik untuk Kakak.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: ["prod-1", "prod-2"],
        suggestedTherapies: ["ther-bekam", "ther-gurah"]
      }
    ]);
  }, []);

  // Save to LocalStorage
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem("bookings_syifa", JSON.stringify(newBookings));
  };

  const saveOrders = (newOrders: any[]) => {
    setOrders(newOrders);
    localStorage.setItem("orders_syifa", JSON.stringify(newOrders));
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart_syifa", JSON.stringify(newCart));
  };

  // Chat scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Simple custom Markdown parser
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, index) => {
      let content = line;
      // Bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      // Bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const bulletContent = line.replace(/^[\s*-]+/, "");
        return (
          <li key={index} className="ml-5 list-disc my-1 text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: bulletContent.replace(boldRegex, "<strong>$1</strong>") }} />
        );
      }
      
      // Headers
      if (line.startsWith("### ")) {
        const headerContent = line.replace(/^###\s+/, "");
        return <h4 key={index} className="text-md font-bold text-emerald-950 mt-4 mb-2 flex items-center gap-1.5" dangerouslySetInnerHTML={{ __html: headerContent.replace(boldRegex, "<strong>$1</strong>") }} />;
      }
      if (line.startsWith("## ")) {
        const headerContent = line.replace(/^##\s+/, "");
        return <h3 key={index} className="text-lg font-bold text-emerald-900 mt-5 mb-2.5 border-b border-emerald-100 pb-1" dangerouslySetInnerHTML={{ __html: headerContent.replace(boldRegex, "<strong>$1</strong>") }} />;
      }
      
      if (line.trim() === "") return <div key={index} className="h-2" />;
      
      return (
        <p key={index} className="text-slate-700 leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: content.replace(boldRegex, "<strong>$1</strong>") }} />
      );
    });
  };

  // Shopping Cart Actions
  const addToCart = (product: Product, quantity = 1) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      newCart = [...cart, { product, quantity }];
    }
    saveCart(newCart);
    showToast(`Berhasil menambahkan ${product.name} ke keranjang!`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
    showToast("Produk dihapus dari keranjang.", "info");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Checkout Actions
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = {
      id: "ORD-" + Math.floor(Math.random() * 90000 + 10000),
      items: cart,
      customerName: checkoutForm.name,
      customerPhone: checkoutForm.phone,
      customerAddress: checkoutForm.address,
      shipping: checkoutForm.shipping,
      payment: checkoutForm.payment,
      totalPrice: getCartTotal() + (checkoutForm.shipping === "express" ? 15000 : 0),
      status: "Menunggu Pembayaran",
      createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    };

    saveOrders([newOrder, ...orders]);
    saveCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    showToast("Pesanan herba berhasil dibuat!", "success");

    // Generate WhatsApp Text Link
    const orderItemsText = newOrder.items.map(item => `- ${item.product.name} (${item.quantity}x)`).join("%0A");
    const waText = `Halo Asy-Syifa Wellness, saya ingin mengonfirmasi pesanan produk herbal:%0A%0A*ID Pesanan:* ${newOrder.id}%0A*Nama:* ${newOrder.customerName}%0A*No. WhatsApp:* ${newOrder.customerPhone}%0A*Alamat:* ${newOrder.customerAddress}%0A*Pengiriman:* ${newOrder.shipping === "express" ? "Kurir Kilat (Rp 15.000)" : "Ambil Sendiri"}%0A*Metode Bayar:* ${newOrder.payment.toUpperCase()}%0A%0A*Item Pesanan:*%0A${orderItemsText}%0A%0A*Total Pembayaran:* Rp ${(newOrder.totalPrice).toLocaleString("id-ID")}%0A%0AMohon segera diproses ya, terima kasih.`;
    window.open(`https://api.whatsapp.com/send?phone=628123456789&text=${waText}`, "_blank");
  };

  // Booking Therapy Actions
  const startBooking = (therapy: Therapy) => {
    setBookingTherapy(therapy);
    setBookingStep(1);
    setBookingForm({
      therapistId: "",
      date: "",
      time: "",
      name: "",
      phone: "",
      notes: "",
      gender: "L"
    });
  };

  const handleBookingSubmit = () => {
    if (!bookingTherapy) return;

    const selectedTherapist = therapists.find(t => t.id === bookingForm.therapistId) || therapists[0];
    const newBooking: Booking = {
      id: "BKG-" + Math.floor(Math.random() * 90000 + 10000),
      therapy: bookingTherapy,
      therapist: selectedTherapist,
      date: bookingForm.date,
      time: bookingForm.time,
      customerName: bookingForm.name,
      customerPhone: bookingForm.phone,
      customerNotes: bookingForm.notes,
      status: "Menunggu",
      totalPrice: bookingTherapy.price,
      createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    };

    saveBookings([newBooking, ...bookings]);
    setBookingTherapy(null);
    showToast("Jadwal terapi berhasil dipesan!", "success");

    // Generate WhatsApp Booking Link
    const waText = `Halo Asy-Syifa Wellness, saya baru saja melakukan booking terapi:%0A%0A*ID Booking:* ${newBooking.id}%0A*Terapi:* ${newBooking.therapy.name}%0A*Terapis:* ${newBooking.therapist.name}%0A*Hari/Tanggal:* ${newBooking.date}%0A*Jam Sesi:* ${newBooking.time}%0A*Nama Pasien:* ${newBooking.customerName}%0A*No. Kontak:* ${newBooking.customerPhone}%0A*Catatan/Keluhan:* ${newBooking.customerNotes || "-"}%0A%0A*Total Biaya:* Rp ${newBooking.totalPrice.toLocaleString("id-ID")}%0A%0AMohon konfirmasikan jadwal saya, terima kasih.`;
    window.open(`https://api.whatsapp.com/send?phone=628123456789&text=${waText}`, "_blank");
  };

  const cancelBooking = (id: string) => {
    if (confirm("Apakah Kakak yakin ingin membatalkan jadwal terapi ini?")) {
      const updated = bookings.map(b => b.id === id ? { ...b, status: "Dibatalkan" as const } : b);
      saveBookings(updated);
      showToast("Jadwal terapi telah dibatalkan.", "info");
    }
  };

  // AI Chat Bot Actions
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setIsChatLoading(true);

    // Prepare message history formatted for backend Gemini API
    const history = chatMessages.map(msg => ({
      role: msg.sender === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.text }]
    }));
    history.push({ role: "user", parts: [{ text: textToSend }] });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan server");
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-ai",
        sender: "ai",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        suggestedProducts: data.recommendedProducts || [],
        suggestedTherapies: data.recommendedTherapies || []
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-err",
        sender: "ai",
        text: "Afwan Kak, terjadi gangguan koneksi ke server Asy-Syifa AI. Silakan sampaikan kembali keluhan Kakak sebentar lagi.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Date and Time options helper
  const getNext7Days = () => {
    const days = [];
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short" };
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toLocaleDateString("id-ID", options));
    }
    return days;
  };

  const timeSlots = ["09:00 - 10:00", "10:30 - 11:30", "13:00 - 14:00", "14:30 - 15:30", "16:00 - 17:00", "19:30 - 20:30"];

  // Filtered products list
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || prod.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-4 bg-emerald-950/95 backdrop-blur-md text-white shadow-xl shadow-emerald-950/10 rounded-full text-xs sm:text-sm font-semibold border border-emerald-500/20"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Professional Strip */}
      <div className="bg-emerald-950 text-emerald-100/90 text-[11px] py-2.5 px-6 border-b border-emerald-900/50 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Ruko Asy-Syifa, Jl. Herbal Raya No. 12, Jakarta</span>
            <span className="flex items-center gap-1.5 font-medium"><Phone className="w-3.5 h-3.5 text-emerald-400" /> WA: 0812-3456-7890</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-emerald-300">
            <span className="flex items-center gap-1">✨ Terapis Bersertifikat Resmi</span>
            <span className="flex items-center gap-1">🛡️ 100% Alat Steril & Sekali Pakai</span>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md shadow-xs border-b border-emerald-100/60 py-3.5 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Brand in the style of AMANAWellness */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/15 shrink-0">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-emerald-950 italic">ASY-SYIFA<span className="text-emerald-600">Wellness</span></span>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Herbal & Terapi Modern</p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            <button 
              id="tab-btn-terapi"
              onClick={() => setActiveTab("terapi")}
              className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${activeTab === "terapi" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"}`}
            >
              Layanan Terapi
            </button>
            <button 
              id="tab-btn-toko"
              onClick={() => setActiveTab("toko")}
              className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${activeTab === "toko" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"}`}
            >
              Toko Herbal
            </button>
            <button 
              id="tab-btn-konsultasi"
              onClick={() => setActiveTab("konsultasi")}
              className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === "konsultasi" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-pulse" /> Tanya Ahli AI
            </button>
            <button 
              id="tab-btn-pesanan"
              onClick={() => setActiveTab("pesanan")}
              className={`px-4.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 relative ${activeTab === "pesanan" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"}`}
            >
              Sesi & Pesanan
              {(bookings.length > 0 || orders.length > 0) && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping absolute top-1 right-2" />
              )}
            </button>
          </nav>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Consultation Call to Action */}
            <button 
              id="btn-quick-consult"
              onClick={() => setActiveTab("konsultasi")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition-all border border-emerald-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Konsultasi Gratis
            </button>

            {/* Shopping Cart Trigger Button */}
            <button 
              id="btn-toggle-cart"
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full hover:bg-emerald-50/60 relative text-slate-700 hover:text-emerald-700 transition-all"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-bounce shadow">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Footer Navigation Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-150 py-3 px-4 z-40 shadow-2xl flex justify-around items-center">
        <button 
          onClick={() => setActiveTab("terapi")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "terapi" ? "text-emerald-600 scale-105" : "text-slate-500"}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold">Terapi</span>
        </button>
        <button 
          onClick={() => setActiveTab("toko")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "toko" ? "text-emerald-600 scale-105" : "text-slate-500"}`}
        >
          <Leaf className="w-5 h-5" />
          <span className="text-[10px] font-bold">Herbal</span>
        </button>
        <button 
          onClick={() => setActiveTab("konsultasi")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "konsultasi" ? "text-emerald-600 font-bold scale-105" : "text-slate-500"}`}
        >
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-bold">Tanya AI</span>
        </button>
        <button 
          onClick={() => setActiveTab("pesanan")}
          className={`flex flex-col items-center gap-1 relative transition-all ${activeTab === "pesanan" ? "text-emerald-600 scale-105" : "text-slate-500"}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Sesi & Order</span>
          {(bookings.length > 0 || orders.length > 0) && (
            <span className="absolute top-0 right-3 w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Application Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LAYANAN TERAPI */}
          {activeTab === "terapi" && (
            <motion.div
              key="tab-terapi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Promo Banner / Intro with Stats Grid */}
              <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-emerald-800/40 flex flex-col lg:flex-row gap-8 items-center justify-between">
                {/* Decorative background blur blob */}
                <div className="absolute -right-10 -top-20 w-[400px] h-[400px] bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-emerald-750 rounded-full mix-blend-multiply filter blur-3xl opacity-15 pointer-events-none"></div>

                <div className="lg:w-7/12 relative z-10 space-y-4">
                  <span className="bg-emerald-800/55 border border-emerald-700 text-emerald-300 text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> Profesional & Sesuai Syariat (Syar'i)
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-light leading-tight">
                    Solusi <span className="font-bold text-emerald-400">Kesehatan</span> <br/>Alami & Terpercaya
                  </h2>
                  <p className="text-emerald-200/80 max-w-lg text-sm leading-relaxed">
                    Menyatukan kearifan herbal tradisional nusantara dengan teknik terapi fisik modern seperti Bekam Medik Steril dan Gurah Pernapasan Daun Srigunggu untuk vitalitas tubuh maksimal Kakak.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-200/90 font-medium">
                    <span className="flex items-center gap-1.5">✓ Terapis Pria & Wanita Terpisah</span>
                    <span className="flex items-center gap-1.5">✓ Kamar Terapi Higienis</span>
                    <span className="flex items-center gap-1.5">✓ Jarum Steril Sekali Pakai</span>
                  </div>
                </div>

                {/* 4-Grid Stats Panel directly from the theme */}
                <div className="lg:w-5/12 w-full relative z-10">
                  <div className="grid grid-cols-2 gap-3.5 w-full h-full">
                    <div className="bg-emerald-900/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-800/50 backdrop-blur-md hover:border-emerald-700/60 transition-all shadow-inner">
                       <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-sans tracking-tight">15k+</div>
                       <div className="text-[10px] uppercase text-emerald-300 font-bold tracking-wide">Pelanggan Puas</div>
                    </div>
                    <div className="bg-emerald-900/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-800/50 backdrop-blur-md hover:border-emerald-700/60 transition-all shadow-inner">
                       <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-sans tracking-tight">100%</div>
                       <div className="text-[10px] uppercase text-emerald-300 font-bold tracking-wide">Bahan Organik</div>
                    </div>
                    <div className="bg-emerald-900/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-800/50 backdrop-blur-md hover:border-emerald-700/60 transition-all shadow-inner">
                       <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-sans tracking-tight">24/7</div>
                       <div className="text-[10px] uppercase text-emerald-300 font-bold tracking-wide">Konsultasi AI</div>
                    </div>
                    <div className="bg-emerald-900/40 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-800/50 backdrop-blur-md hover:border-emerald-700/60 transition-all shadow-inner">
                       <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-sans tracking-tight">5★</div>
                       <div className="text-[10px] uppercase text-emerald-300 font-bold tracking-wide">Rating Ahli Terapi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapy Cards Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {therapies.map(therapy => (
                  <div 
                    key={therapy.id} 
                    id={`therapy-card-${therapy.id}`}
                    className="bg-white rounded-3xl border border-emerald-100/40 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-350 overflow-hidden flex flex-col group"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={therapy.image} 
                        alt={therapy.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-emerald-800 border border-emerald-100/40 font-bold px-3 py-1.5 rounded-full text-xs shadow-xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {therapy.duration} Menit
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-emerald-600 transition-colors">{therapy.name}</h3>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{therapy.description}</p>
                        
                        {/* Benefits list preview */}
                        <div className="pt-2 space-y-2">
                          <span className="text-[10px] font-extrabold text-emerald-750 uppercase tracking-widest block">Khasiat Utama:</span>
                          {therapy.benefits.slice(0, 2).map((b, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100/80 pt-4.5 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Biaya Sesi</span>
                          <span className="text-lg font-extrabold text-emerald-900">Rp {therapy.price.toLocaleString("id-ID")}</span>
                        </div>
                        <button
                          id={`btn-book-${therapy.id}`}
                          onClick={() => startBooking(therapy)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 hover:scale-[1.02] transition-all"
                        >
                          Booking Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certified Therapists Section */}
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-600 pl-3.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Terapis Ahli Bersertifikat Kami</h3>
                  <p className="text-xs text-slate-500">Praktisi berpengalaman medis dan pengobatan tradisional, menjaga adab dan kenyamanan Kakak.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {therapists.map(ther => (
                    <div key={ther.id} className="bg-white rounded-2xl p-4.5 border border-emerald-100/40 shadow-xs hover:shadow-md transition-all flex gap-3.5 items-center">
                      <img 
                        src={ther.photo} 
                        alt={ther.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-emerald-100/80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">{ther.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{ther.role}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50/70 text-emerald-750 rounded-md">
                            {ther.gender === "L" ? "Pria (Ikhwan)" : "Wanita (Akhwat)"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">★ {ther.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TOKO HERBAL ONLINE */}
          {activeTab === "toko" && (
            <motion.div
              key="tab-toko"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Header Search & Filtering */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-100/40 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="w-full md:max-w-md relative">
                  <input 
                    type="text" 
                    placeholder="Cari obat herbal atau kegunaannya (cth: batuk)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-full px-5 py-3 pl-11 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                  <Leaf className="w-4 h-4 text-emerald-600 absolute left-4 top-4" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-emerald-700 transition-colors"
                      aria-label="Hapus pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "Semua Produk" },
                    { id: "madu", label: "Madu Herbal" },
                    { id: "herbal", label: "Kapsul Herbal" },
                    { id: "minyak", label: "Minyak Gosok" },
                    { id: "teh", label: "Teh Kesehatan" }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${categoryFilter === cat.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15" : "bg-slate-50 text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Catalog Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      id={`product-card-${product.id}`}
                      className="bg-white rounded-3xl border border-emerald-100/40 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between overflow-hidden group relative"
                    >
                      {/* Product Image */}
                      <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md text-emerald-950 hover:bg-emerald-600 hover:text-white text-[10px] font-bold py-2 rounded-full text-center opacity-0 group-hover:opacity-100 transition-all shadow shadow-slate-900/10"
                        >
                          Lihat Detail Khasiat
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-4.5 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-md">
                            {product.category}
                          </span>
                          <h4 
                            onClick={() => setSelectedProduct(product)}
                            className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-600 cursor-pointer transition-colors leading-tight pt-1"
                          >
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-slate-450 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mb-2.5">
                            <span className="text-amber-500">★ {product.rating}</span>
                            <span>•</span>
                            <span>{product.reviews} ulasan</span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100/85">
                            <span className="font-extrabold text-emerald-700 text-sm sm:text-base">Rp {product.price.toLocaleString("id-ID")}</span>
                            <button
                              id={`add-to-cart-${product.id}`}
                              onClick={() => addToCart(product)}
                              className="w-8.5 h-8.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 hover:scale-105 flex items-center justify-center transition-all shadow-sm"
                              aria-label="Masukkan Keranjang"
                            >
                              <Plus className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl py-12 px-4 text-center border border-slate-100 max-w-md mx-auto space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-350 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-md">Produk tidak ditemukan</h4>
                  <p className="text-xs text-slate-500">Afwan Kak, herba atau manfaat tersebut tidak ada di katalog kami saat ini. Coba gunakan kata pencarian lainnya.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: TANYA AHLI AI */}
          {activeTab === "konsultasi" && (
            <motion.div
              key="tab-konsultasi"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[500px]"
            >
              {/* Left Column: Symptom Suggestions */}
              <div className="md:col-span-1 space-y-5 hidden md:block">
                <div className="bg-emerald-950 text-white rounded-3xl p-5 space-y-3 shadow-lg border border-emerald-800 relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-emerald-600 rounded-full blur-2xl opacity-20 pointer-events-none"></div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Panduan Konsultasi</h4>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed font-medium">
                    Sampaikan keluhan fisik Kakak secara lengkap. AI kami telah dilatih dengan database keilmuan herba nusantara dan bekam sunnah untuk meracik solusi holistik yang pas.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Pilih Cepat Keluhan:</span>
                  {[
                    { label: "Sakit kepala, pundak kaku", text: "Saya sering pusing migrain, pundak kaku, dan punya tensi darah tinggi. Terapi atau herba apa yang cocok?" },
                    { label: "Lendir sinus & tenggorokan gatal", text: "Hidung saya sering tersumbat karena lendir sinus, tenggorokan gatal, dan batuk kering. Saya mau suara bersih." },
                    { label: "Badan capek & susah tidur", text: "Badan saya letih luar biasa sehabis kerja keras, otot kaku semua, dan susah sekali tidur nyenyak di malam hari." },
                    { label: "Asam lambung gerd kambuh", text: "Asam lambung saya sering naik, perut kembung, begah, dan terasa mual perih saat telat makan." }
                  ].map((symptom, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(symptom.text)}
                      className="w-full text-left bg-white hover:bg-emerald-50/60 border border-emerald-100/40 hover:border-emerald-200 rounded-2xl p-3.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all leading-relaxed shadow-xs"
                    >
                      {symptom.label} <span className="text-emerald-500 float-right">→</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Chat Console */}
              <div className="md:col-span-3 bg-white rounded-3xl border border-emerald-100/60 shadow-sm flex flex-col h-full overflow-hidden">
                {/* Chat Header */}
                <div className="px-5 py-4 bg-white border-b border-emerald-100/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-emerald-950">Konsultan Herbal & Terapi AI</h3>
                    <p className="text-[10px] text-slate-450 flex items-center gap-1 font-medium">● Ahli Pengobatan Asy-Syifa Aktif</p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold px-1">
                        <span>{msg.sender === "user" ? "Saya" : "Ustadz AI Asy-Syifa"}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      {/* Message Bubble */}
                      <div 
                        className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-xs ${msg.sender === "user" ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10" : "bg-white border border-emerald-100/50 text-slate-800 rounded-tl-none"}`}
                      >
                        {msg.sender === "user" ? (
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                        ) : (
                          <div className="space-y-2">
                            {renderMarkdown(msg.text)}
                          </div>
                        )}

                        {/* Interactive Suggestions Render (Products / Therapies recommendation) */}
                        {msg.sender === "ai" && (msg.suggestedProducts?.length || msg.suggestedTherapies?.length) && (
                          <div className="mt-4 pt-3.5 border-t border-emerald-100/50 space-y-3.5">
                            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block">Rekomendasi Terapi & Herba Khusus:</span>
                            
                            {/* Products recommendation */}
                            {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                              <div className="space-y-2.5">
                                {products.filter(p => msg.suggestedProducts!.includes(p.id)).map(p => (
                                  <div key={p.id} className="bg-emerald-50/30 border border-emerald-100/40 rounded-2xl p-3 flex items-center justify-between gap-3 hover:bg-emerald-50/70 transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-emerald-100/30" referrerPolicy="no-referrer" />
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-xs text-slate-950 truncate leading-tight">{p.name}</h5>
                                        <span className="text-[10px] font-extrabold text-emerald-700">Rp {p.price.toLocaleString("id-ID")}</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => addToCart(p)}
                                      className="bg-slate-900 hover:bg-emerald-600 text-white text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-1 shadow-xs transition-all shrink-0"
                                    >
                                      <ShoppingCart className="w-3 h-3" /> Tambah
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Therapies recommendation */}
                            {msg.suggestedTherapies && msg.suggestedTherapies.length > 0 && (
                              <div className="space-y-2.5">
                                {therapies.filter(t => msg.suggestedTherapies!.includes(t.id)).map(t => (
                                  <div key={t.id} className="bg-emerald-50/30 border border-emerald-100/40 rounded-2xl p-3 flex items-center justify-between gap-3 hover:bg-emerald-50/70 transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <img src={t.image} alt={t.name} className="w-11 h-11 rounded-xl object-cover shrink-0 border border-emerald-100/30" referrerPolicy="no-referrer" />
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-xs text-slate-950 truncate leading-tight">{t.name}</h5>
                                        <span className="text-[10px] font-extrabold text-emerald-700">Rp {t.price.toLocaleString("id-ID")}</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => startBooking(t)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-4.5 py-2 rounded-full shadow-xs transition-all shrink-0"
                                    >
                                      Pesan Jadwal
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Chat Loading Indicator */}
                  {isChatLoading && (
                    <div className="flex flex-col items-start space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold px-1">Ustadz AI Asy-Syifa sedang meramu herba...</div>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-emerald-900 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatBottomRef} />
                </div>

                {/* Mobile Symptom Quick suggestions */}
                <div className="px-4 py-3 bg-slate-50/70 border-t border-emerald-100/40 flex gap-2 overflow-x-auto md:hidden scrollbar-none">
                  {[
                    { label: "Pusing/Migrain", text: "Saya sering pusing migrain dan pundak kaku, terapi herba apa yang cocok?" },
                    { label: "Gurah/Lendir", text: "Hidung saya sering mampet karena lendir sinus gatal, mau terapi gurah srigunggu." },
                    { label: "Letih/Pegal", text: "Badan capek semua sehabis kerja keras fisik dan susah tidur nyenyak." },
                    { label: "Lambung/Maag", text: "Asam lambung gerd saya sering kambuh kembung dan perih." }
                  ].map((sym, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sym.text)}
                      className="bg-white hover:bg-emerald-50/50 border border-emerald-100/40 hover:border-emerald-200 px-3.5 py-2 rounded-full text-[11px] font-bold text-slate-600 shadow-xs shrink-0 transition-all"
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>

                {/* Chat Input Area */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                  className="p-4 bg-white border-t border-emerald-100/50 flex gap-3"
                >
                  <input 
                    type="text" 
                    placeholder="Sampaikan keluhan kesehatan Anda di sini..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    className="flex-1 bg-slate-50 border border-slate-200/80 rounded-full px-5 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all disabled:opacity-60 text-slate-800"
                  />
                  <button 
                    type="submit" 
                    disabled={!chatInput.trim() || isChatLoading}
                    className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:bg-slate-100 disabled:text-slate-400 shrink-0 shadow-md shadow-emerald-600/15 hover:scale-105 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SESI & PESANAN SAYA */}
          {activeTab === "pesanan" && (
            <motion.div
              key="tab-pesanan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              {/* Therapy Sessions Portal */}
              <div className="space-y-4">
                <div className="border-l-4 border-emerald-600 pl-3.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Jadwal Sesi Terapi Saya</h3>
                  <p className="text-xs text-slate-500">Daftar booking bekam, gurah, atau pijat fisik Anda.</p>
                </div>

                {bookings.length > 0 ? (
                  <div className="space-y-3.5">
                    {bookings.map(bkg => (
                      <div key={bkg.id} className="bg-white rounded-3xl border border-emerald-100/40 p-5 shadow-xs flex flex-col sm:flex-row justify-between gap-4 hover:shadow-md transition-all">
                        <div className="flex gap-4">
                          <img src={bkg.therapy.image} alt={bkg.therapy.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-emerald-100/30" referrerPolicy="no-referrer" />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900">{bkg.therapy.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md uppercase font-mono">{bkg.id}</span>
                            </div>
                            <p className="text-xs text-slate-600 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-emerald-650" /> Terapis: <strong className="text-slate-800">{bkg.therapist.name}</strong>
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                              <span className="flex items-center gap-1.5 font-bold text-slate-755"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {bkg.date}</span>
                              <span className="flex items-center gap-1.5 font-bold text-slate-755"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Sesi: {bkg.time}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-end shrink-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Layanan</span>
                            <span className="font-extrabold text-emerald-700 text-sm sm:text-base">Rp {bkg.totalPrice.toLocaleString("id-ID")}</span>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${bkg.status === "Menunggu" ? "bg-amber-50/70 text-amber-750 border-amber-100/40" : bkg.status === "Selesai" ? "bg-emerald-50/70 text-emerald-750 border-emerald-100/40" : "bg-rose-50/70 text-rose-750 border-rose-100/40"}`}>
                              {bkg.status === "Menunggu" ? "Menunggu Konfirmasi" : bkg.status === "Selesai" ? "Telah Selesai" : "Dibatalkan"}
                            </span>
                            {bkg.status === "Menunggu" && (
                              <button 
                                onClick={() => cancelBooking(bkg.id)}
                                className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline transition-colors"
                              >
                                Batalkan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-emerald-100/40 p-10 text-center text-slate-500 space-y-4">
                    <Calendar className="w-10 h-10 text-emerald-600/30 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-700">Belum ada booking terapi</h4>
                      <p className="text-xs text-slate-450 max-w-md mx-auto">Silakan pilih layanan terapi modern kami di tab "Layanan Terapi" untuk memesan sesi bekam atau gurah.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Orders Portal */}
              <div className="space-y-4 pt-4">
                <div className="border-l-4 border-emerald-600 pl-3.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">Pesanan Produk Herbal Saya</h3>
                  <p className="text-xs text-slate-500">Kelola riwayat pembelian obat herbal Anda.</p>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-3.5">
                    {orders.map(ord => (
                      <div key={ord.id} className="bg-white rounded-3xl border border-emerald-100/40 p-5 shadow-xs space-y-4">
                        <div className="flex justify-between items-start gap-4 flex-wrap pb-2 border-b border-slate-100/80">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Nomor Pesanan</span>
                            <span className="font-extrabold text-sm text-slate-900 uppercase font-mono">{ord.id}</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Tanggal Pembelian</span>
                            <span className="text-xs text-slate-650 font-medium">{ord.createdAt}</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Status</span>
                            <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100/40 rounded-full">{ord.status}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2.5">
                          {ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                              <span>{item.product.name} <strong className="text-slate-400 font-semibold">x {item.quantity}</strong></span>
                              <span className="font-bold text-slate-800">Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3.5 border-t border-slate-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                          <div className="text-slate-550">
                            <span>Kirim ke: <strong>{ord.customerName}</strong> <span className="text-slate-400">({ord.customerAddress})</span></span>
                          </div>
                          <div className="text-right shrink-0 w-full sm:w-auto">
                            <span className="text-slate-450 mr-2 font-medium">Total Belanja (+Ongkir):</span>
                            <span className="font-extrabold text-emerald-750 text-sm sm:text-base">Rp {ord.totalPrice.toLocaleString("id-ID")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-emerald-100/40 p-10 text-center text-slate-500 space-y-4">
                    <ShoppingBag className="w-10 h-10 text-emerald-600/30 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-700">Belum ada pesanan herba</h4>
                      <p className="text-xs text-slate-450 max-w-md mx-auto">Lihat ramuan tradisional berkualitas murni di tab "Toko Herbal" dan rasakan manfaat alaminya.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* OVERLAY 1: PRODUCT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-emerald-100/40"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 bg-slate-50 border border-emerald-100/30 hover:bg-emerald-50 p-2.5 rounded-full text-slate-650 hover:text-emerald-700 transition-all z-10"
                aria-label="Tutup Detail Produk"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="grid sm:grid-cols-2 gap-6 p-6 sm:p-8">
                {/* Left: Product Image */}
                <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-emerald-100/30 shadow-inner">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                {/* Right: Product Info */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 px-2.5 py-1 bg-emerald-50 rounded-md">
                      {selectedProduct.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">{selectedProduct.name}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{selectedProduct.description}</p>
                    
                    {/* Benefits List */}
                    <div className="space-y-2 pt-2.5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Khasiat & Khasiat Herbal:</span>
                      {selectedProduct.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                          <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100/80 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-450 font-medium">Harga Satuan:</span>
                      <span className="text-xl font-extrabold text-emerald-700">Rp {selectedProduct.price.toLocaleString("id-ID")}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="btn-add-to-cart-modal"
                        onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" /> Tambah Keranjang
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 2: BOOKING THERAPY DIALOG */}
      <AnimatePresence>
        {bookingTherapy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden border border-emerald-100/30"
            >
              {/* Close Button */}
              <button 
                onClick={() => setBookingTherapy(null)}
                className="absolute top-4 right-4 bg-slate-50 border border-emerald-100/30 hover:bg-emerald-50 p-2.5 rounded-full text-slate-650 hover:text-emerald-700 transition-all z-10"
                aria-label="Batalkan Booking"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Header Title */}
              <div className="p-6 bg-emerald-950 text-white flex items-center gap-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Booking Sesi Terapi</h3>
                  <p className="text-[11px] text-emerald-200/80 leading-none mt-1 font-medium">{bookingTherapy.name}</p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex bg-emerald-900/10 h-1">
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(bookingStep / 4) * 100}%` }} />
              </div>

              {/* Booking Steps Body */}
              <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
                
                {/* STEP 1: SELECT GENDER & THERAPIST */}
                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100/40 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-850 flex items-center gap-1.5">🌿 Adab Kesopanan Syar'i</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Demi menjaga adab kenyamanan fisik, pasien laki-laki (ikhwan) WAJIB dilayani oleh terapis pria. Dan pasien wanita (akhwat) WAJIB dilayani oleh terapis wanita.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">Tentukan Jenis Kelamin Anda (Pasien):</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setBookingForm(p => ({ ...p, gender: "L", therapistId: "" }))}
                          className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${bookingForm.gender === "L" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                        >
                          Laki-laki (Ikhwan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingForm(p => ({ ...p, gender: "P", therapistId: "" }))}
                          className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${bookingForm.gender === "P" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                        >
                          Perempuan (Akhwat)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-bold text-slate-700 block">Pilih Terapis Berpengalaman ({bookingForm.gender === "L" ? "Pria" : "Wanita"}):</label>
                      <div className="space-y-2">
                        {therapists.filter(t => t.gender === bookingForm.gender).map(ther => (
                          <button
                            key={ther.id}
                            type="button"
                            onClick={() => setBookingForm(p => ({ ...p, therapistId: ther.id }))}
                            className={`w-full text-left p-3 rounded-2xl border flex gap-3.5 items-center transition-all ${bookingForm.therapistId === ther.id ? "bg-emerald-50/70 border-emerald-500 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                          >
                            <img src={ther.photo} alt={ther.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-emerald-100" referrerPolicy="no-referrer" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{ther.name}</h4>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">{ther.role}</p>
                              <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ {ther.experience}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: CHOOSE DATE & TIME */}
                {bookingStep === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 block">Pilih Tanggal Sesi Terapi:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getNext7Days().map((dayStr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBookingForm(p => ({ ...p, date: dayStr }))}
                            className={`py-2.5 px-3 rounded-2xl text-xs text-center border font-bold transition-all ${bookingForm.date === dayStr ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                          >
                            {dayStr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <label className="text-xs font-bold text-slate-700 block">Pilih Jam Sesi:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBookingForm(p => ({ ...p, time: slot }))}
                            className={`py-2.5 px-3 rounded-2xl text-xs border font-bold transition-all flex items-center justify-center gap-1.5 ${bookingForm.time === slot ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                          >
                            <Clock className="w-3.5 h-3.5 opacity-60" /> {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CUSTOMER PARTICULARS */}
                {bookingStep === 3 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Nama Lengkap Pasien:</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Muhammad Ali"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-850"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">No. WhatsApp Aktif (Untuk Konfirmasi):</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="Contoh: 081234567890"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-850"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Catatan Keluhan / Alergi (Opsional):</label>
                      <textarea 
                        placeholder="Sampaikan jika ada keluhan khusus (cth: batuk berdahak 3 hari, sering migrain menahun, riwayat tensi tinggi)"
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm(p => ({ ...p, notes: e.target.value }))}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none text-slate-850"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: PREVIEW & DONE */}
                {bookingStep === 4 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50/40 border border-emerald-100/40 rounded-3xl p-5 space-y-3.5">
                      <span className="text-xs font-extrabold text-emerald-750 block border-b border-emerald-100/60 pb-2 uppercase tracking-wider">Ringkasan Konfirmasi Booking</span>
                      
                      <div className="space-y-2 text-xs text-slate-700 font-medium">
                        <div className="flex justify-between">
                          <span className="text-slate-450">Terapi:</span>
                          <strong className="text-slate-900 font-bold">{bookingTherapy.name}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Terapis:</span>
                          <strong className="text-slate-900 font-bold">{therapists.find(t => t.id === bookingForm.therapistId)?.name || "Terapis"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Tanggal:</span>
                          <strong className="text-slate-900 font-bold">{bookingForm.date}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Waktu:</span>
                          <strong className="text-slate-900 font-bold">{bookingForm.time}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-450">Nama Pasien:</span>
                          <strong className="text-slate-900 font-bold">{bookingForm.name}</strong>
                        </div>
                        <div className="flex justify-between border-t border-emerald-100/60 pt-2.5 font-bold text-sm">
                          <span className="text-slate-800">Total Biaya Terapi:</span>
                          <span className="text-emerald-700 font-extrabold text-base">Rp {bookingTherapy.price.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold">
                      Sistem kami akan menghasilkan invoice booking otomatis dan mengalihkan Kakak ke admin WhatsApp Asy-Syifa untuk verifikasi jadwal.
                    </p>
                  </div>
                )}

              </div>

              {/* Booking Actions Panel */}
              <div className="p-4.5 bg-slate-50 border-t border-slate-100/80 flex justify-between items-center">
                {bookingStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setBookingStep(p => p - 1)}
                    className="text-xs font-bold text-slate-500 hover:text-emerald-700 px-4 py-2 transition-colors"
                  >
                    Kembali
                  </button>
                ) : (
                  <div />
                )}

                {bookingStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setBookingStep(p => p + 1)}
                    disabled={
                      (bookingStep === 1 && !bookingForm.therapistId) ||
                      (bookingStep === 2 && (!bookingForm.date || !bookingForm.time)) ||
                      (bookingStep === 3 && (!bookingForm.name || !bookingForm.phone))
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all"
                  >
                    Lanjutkan Sesi
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBookingSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-7 py-3 rounded-full shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    Konfirmasi Booking & Hubungi WA
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 3: SHOPPING CART DRAWERS */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-md flex justify-end"
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative border-l border-emerald-100/30"
            >
              {/* Header */}
              <div className="p-6 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm tracking-tight">Keranjang Belanja</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-emerald-900 text-emerald-200 transition-all"
                  aria-label="Tutup keranjang"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Items list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-3.5 items-center pb-4 border-b border-slate-100/80">
                        <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-emerald-100/20" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{item.product.name}</h4>
                          <span className="text-xs font-bold text-emerald-700">Rp {item.product.price.toLocaleString("id-ID")}</span>
                          
                          {/* Quantity manipulation */}
                          <div className="flex items-center gap-3 pt-1">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-500 transition-all"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-500 transition-all"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                          aria-label="Hapus Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 text-slate-500 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-emerald-600/20 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-700">Keranjang masih kosong</h4>
                      <p className="text-xs text-slate-450 max-w-[240px] mx-auto">Silakan kunjungi "Toko Herbal" dan tambahkan produk yang Kakak butuhkan.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              {cart.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100/80 space-y-4">
                  <div className="flex justify-between text-xs text-slate-750 font-semibold">
                    <span>Subtotal Produk:</span>
                    <strong className="text-emerald-750 font-extrabold text-sm sm:text-base">Rp {getCartTotal().toLocaleString("id-ID")}</strong>
                  </div>

                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all"
                  >
                    Beli & Checkout Pesanan
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY 4: CHECKOUT FORM DIALOG */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden border border-emerald-100/30"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 bg-slate-50 border border-emerald-100/30 hover:bg-emerald-50 p-2.5 rounded-full text-slate-650 hover:text-emerald-700 transition-all z-10"
                aria-label="Batalkan Checkout"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="p-6 bg-emerald-950 text-white flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Checkout Pesanan</h3>
                  <p className="text-[11px] text-emerald-200/80 leading-none mt-1 font-medium">Selesaikan informasi pengiriman obat herba</p>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Nama Lengkap Penerima:</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Muhammad Ali"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">No. WhatsApp Aktif:</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="Contoh: 081234567890"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Alamat Pengiriman Lengkap:</label>
                  <textarea 
                    required
                    placeholder="Contoh: Perumahan Indah Permai Blok C No. 5, Kecamatan Kebayoran Baru, Jakarta Selatan"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm(p => ({ ...p, address: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none text-slate-850"
                  />
                </div>

                {/* Shipping Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Opsi Pengiriman:</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm(p => ({ ...p, shipping: "express" }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs text-center border font-bold transition-all ${checkoutForm.shipping === "express" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                    >
                      Kurir Kilat (+Rp 15k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm(p => ({ ...p, shipping: "ambil" }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs text-center border font-bold transition-all ${checkoutForm.shipping === "ambil" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                    >
                      Ambil Sendiri
                    </button>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Metode Pembayaran:</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm(p => ({ ...p, payment: "transfer" }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs text-center border font-bold transition-all ${checkoutForm.payment === "transfer" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                    >
                      Transfer Bank Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutForm(p => ({ ...p, payment: "cod" }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs text-center border font-bold transition-all ${checkoutForm.payment === "cod" ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"}`}
                    >
                      Bayar di Tempat (COD)
                    </button>
                  </div>
                </div>

                {/* Final Total review */}
                <div className="pt-4 border-t border-slate-100/80 flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Total Tagihan (+Ongkir):</span>
                  <span className="text-lg font-extrabold text-emerald-700">Rp {(getCartTotal() + (checkoutForm.shipping === "express" ? 15000 : 0)).toLocaleString("id-ID")}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/25 transition-all"
                >
                  Selesaikan Order & Hubungi WA Admin
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Menu, Loader2, Send, ArrowRight, Trophy, MapPin, Zap, Newspaper, Dumbbell } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthPopup as Login } from "../components/Login";

const tabIcons = {
  home: Zap,
  event: Trophy,
  "turf-content": MapPin,
  trainer: Dumbbell,
  news: Newspaper,
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "", email: "", phone: "", inquiryType: "Product", message: "", clubName: "", city: "", sports: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const tabs = [
    { key: "home", label: "Home", path: "/l/home" },
    { key: "event", label: "Tournaments", path: "/l/event" },
    { key: "turf-content", label: "Venues", path: "/l/turf-content" },
    { key: "trainer", label: "Training", path: "/l/trainer" },
    { key: "news", label: "News", path: "/l/news" },
  ];

  const activeTab = tabs.find((t) => location.pathname.includes(t.key))?.key || "home";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) {
        axios.get(`/api/search?query=${query}`)
          .then((r) => setSuggestions(r.data))
          .catch(() => setSuggestions(null));
      } else {
        setSuggestions(null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSuggestionClick = (item) => {
    setSelectedResult(item);
    setShowPopup(true);
    setSuggestions(null);
    setQuery("");
    setSearchOpen(false);
  };

  const submitInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await axios.post("/api/inquiries", inquiryForm);
      setSubmitStatus("success");
      setInquiryForm({ name: "", email: "", phone: "", inquiryType: "Product", message: "", clubName: "", city: "", sports: "" });
      setTimeout(() => { setShowInquiry(false); setSubmitStatus(null); }, 4000); // give them 4 seconds to read the confirmation
    } catch { setSubmitStatus("error"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-2" : "py-3"}`}>
        <div className="px-3 sm:px-5 lg:px-8">
          <div className={`relative flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl transition-all duration-500 ${
            scrolled
              ? "bg-gray-950/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/[0.06]"
              : "bg-gray-950/80 backdrop-blur-lg border border-white/[0.03]"
          }`}>

            {/* Accent line at top */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent rounded-full" />

            {/* Left: Logo */}
            <Link to="/l/home" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-105 transition-all duration-300">
                  <img src="/sportapp_logo.png" alt="CK" className="w-full h-full object-contain" />
                </div>
                {/* Live dot */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-950" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[15px] font-extrabold text-white tracking-tight leading-none">
                  Chalo<span className="text-orange-400">Khelne</span>
                </span>
                <span className="text-[9px] font-semibold text-gray-400/60 uppercase tracking-[0.15em] mt-0.5">
                  Sports Platform
                </span>
              </div>
            </Link>

            {/* Center: Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-1 border border-white/[0.03]">
                {tabs.map((tab) => {
                  const Icon = tabIcons[tab.key];
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => navigate(tab.path)}
                      className={`relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 flex items-center gap-2 ${
                        isActive ? "text-white" : "text-gray-300/60 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navActive"
                          className="absolute inset-0 bg-orange-500/15 rounded-lg border border-orange-500/20"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-400" : ""}`} />}
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-all duration-300 ${
                  searchOpen
                    ? "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/20"
                    : "bg-white/[0.03] text-gray-300/50 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>

              {/* Contact */}
              <button
                onClick={() => setShowInquiry(true)}
                className="hidden md:flex px-3.5 py-2 text-[13px] font-medium text-gray-300/60 hover:text-white rounded-xl hover:bg-white/[0.04] transition-all"
              >
                Contact
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />

              {/* Login */}
              <button
                onClick={() => setShowLogin(true)}
                className="px-5 py-2 text-[13px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.97] w-auto"
              >
                Sign In
              </button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden flex w-9 h-9 items-center justify-center rounded-xl bg-white/[0.04] text-gray-300/60 hover:text-white hover:bg-white/[0.08] transition-all"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── SEARCH PANEL ────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[98] bg-black/30"
              onClick={() => { setSearchOpen(false); setSuggestions(null); setQuery(""); }}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[99] w-full max-w-lg px-4"
            >
              <div className="bg-gray-950 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.04]">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search tournaments, venues, players..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-300/40 outline-none"
                  />
                  {query && (
                    <button onClick={() => { setQuery(""); setSuggestions(null); }} className="text-gray-300/40 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Results */}
                {suggestions && (
                  <div className="max-h-80 overflow-y-auto">
                    {Object.values(suggestions).every((a) => a.length === 0) ? (
                      <div className="px-5 py-10 text-center">
                        <Search className="w-8 h-8 text-gray-300/20 mx-auto mb-2" />
                        <p className="text-sm text-gray-300/40">No results found</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {["tournaments", "turfs", "users"].map((key) =>
                          (suggestions[key] || []).length > 0 && (
                            <div key={key}>
                              <div className="px-5 py-1.5 text-[10px] font-bold text-gray-400/40 uppercase tracking-wider">
                                {key}
                              </div>
                              {suggestions[key].map((item) => (
                                <button
                                  key={item._id}
                                  className="w-full text-left px-5 py-3 hover:bg-white/[0.03] transition-colors flex items-center justify-between group"
                                  onClick={() => handleSuggestionClick(item)}
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-white truncate">{item.name || item.title}</div>
                                    {(item.eventLocation || item.address) && (
                                      <div className="text-[11px] text-gray-300/30 mt-0.5 truncate">
                                        {item.eventLocation || (typeof item.address === "string" ? item.address : item.address?.fullAddress || item.address?.area || "")}
                                      </div>
                                    )}
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-300/10 group-hover:text-orange-400 transition-colors shrink-0 ml-3" />
                                </button>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Shortcut hint */}
                {!suggestions && !query && (
                  <div className="px-5 py-6 text-center">
                    <p className="text-xs text-gray-300/30">Type to search across tournaments, venues, and players</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MOBILE MENU ────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-[72px] left-3 right-3 z-[95] bg-gray-950 border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/50 lg:hidden overflow-hidden"
            >
              {/* Top accent */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

              <div className="p-4">
                {/* Mobile search */}
                <div className="flex items-center bg-white/[0.03] rounded-xl px-4 py-3 mb-4 border border-white/[0.04]">
                  <Search className="w-4 h-4 text-gray-300/40 mr-3" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder:text-gray-300/30 outline-none w-full"
                  />
                </div>

                {/* Mobile nav links */}
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tabIcons[tab.key];
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { navigate(tab.path); setMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                          isActive
                            ? "text-white bg-orange-500/15 border border-orange-500/20"
                            : "text-gray-300/60 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-gray-300/30"}`} />}
                        {tab.label}
                        {isActive && <div className="ml-auto w-1.5 h-1.5 bg-orange-400 rounded-full" />}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-white/[0.04]" />

                {/* Mobile actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowInquiry(true); setMenuOpen(false); }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-300/60 hover:bg-white/[0.03] hover:text-white transition-all text-left flex items-center gap-3"
                  >
                    <Send className="w-4 h-4 text-gray-300/30" />
                    Contact Us
                  </button>
                  <button
                    onClick={() => { setShowLogin(true); setMenuOpen(false); }}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── INQUIRY MODAL ──────────────────────────────────── */}
      <AnimatePresence>
        {showInquiry && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowInquiry(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md bg-gray-950 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Accent line */}
              <div className="h-[2px] bg-gradient-to-r from-orange-500 via-orange-400 to-gray-400" />

              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Get In Touch</h2>
                  <p className="text-xs text-gray-300/40 mt-0.5">We'll respond within 24 hours</p>
                </div>
                <button onClick={() => setShowInquiry(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-gray-300/40 hover:text-white hover:bg-white/[0.08] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 pb-6">
                {submitStatus === "success" ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                      <Send className="w-7 h-7 text-green-400" />
                    </div>
                    <p className="text-lg font-bold text-white">Message Sent!</p>
                    <p className="text-sm text-gray-300/40 mt-1.5">Our team will get back to you shortly. A confirmation email has been sent to your provided email address.</p>
                  </div>
                ) : (
                  <form onSubmit={submitInquiry} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text" name="name" required placeholder="Full Name"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                      />
                      <input
                        type="email" name="email" required placeholder="Email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                    <select
                      value={inquiryForm.inquiryType}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, inquiryType: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-orange-500/30 transition-all appearance-none"
                    >
                      <option value="Product" className="bg-gray-950">General Inquiry</option>
                      <option value="Service" className="bg-gray-950">Booking Support</option>
                      <option value="Partnership" className="bg-gray-950">Partnership</option>
                      <option value="Register Club" className="bg-gray-950">Register Club / Corporate</option>
                      <option value="Other" className="bg-gray-950">Other</option>
                    </select>

                    <AnimatePresence>
                      {inquiryForm.inquiryType === "Register Club" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <input
                            type="text" name="clubName" required placeholder="Club / Company Name"
                            value={inquiryForm.clubName}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, clubName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text" name="city" required placeholder="City"
                              value={inquiryForm.city}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, city: e.target.value })}
                              className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                            />
                            <input
                              type="text" name="sports" required placeholder="Sports (e.g. Cricket)"
                              value={inquiryForm.sports}
                              onChange={(e) => setInquiryForm({ ...inquiryForm, sports: e.target.value })}
                              className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      name="message" rows="3" placeholder="How can we help?"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-gray-300/30 outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all resize-none"
                    />
                    <button
                      type="submit" disabled={isSubmitting}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                    {submitStatus === "error" && (
                      <p className="text-red-400 text-xs text-center mt-1">Failed to send. Please try again.</p>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── SEARCH RESULT POPUP ────────────────────────────── */}
      <AnimatePresence>
        {showPopup && selectedResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowPopup(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="relative w-full max-w-sm bg-gray-950 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Accent */}
              <div className="h-[2px] bg-gradient-to-r from-orange-500 to-amber-400" />

              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg font-bold text-white pr-4 leading-snug">{selectedResult.name || selectedResult.title}</h3>
                  <button onClick={() => setShowPopup(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] text-gray-300/40 hover:text-white shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  {selectedResult.email && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <Send className="w-3.5 h-3.5 text-gray-300/30" />
                      <span className="text-gray-200">{selectedResult.email}</span>
                    </div>
                  )}
                  {selectedResult.description && (
                    <div className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04] text-gray-300/70 leading-relaxed">
                      {selectedResult.description}
                    </div>
                  )}
                  {(selectedResult.address || selectedResult.eventLocation) && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                      <MapPin className="w-3.5 h-3.5 text-gray-300/30" />
                      <span className="text-gray-200">
                        {selectedResult.eventLocation || (typeof selectedResult.address === "string" ? selectedResult.address : selectedResult.address?.fullAddress || [selectedResult.address?.area, selectedResult.address?.city].filter(Boolean).join(", ") || "")}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="mt-5 w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-gray-200 text-sm font-medium rounded-xl transition-colors border border-white/[0.04]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LOGIN MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4 overflow-y-auto">
            <Login onClose={() => setShowLogin(false)} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

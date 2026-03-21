import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Sun, X, Menu, Loader2, Zap, Send, Shield, LayoutGrid, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Login from "../components/Login";
import Logo from "../assets/sportapp_logo.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [showLogin, setShowLogin] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Product",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const tabs = ["home", "event", "social", "news"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim() !== "") {
        axios
          .get(`/api/search?query=${query}`)
          .then((res) => setSuggestions(res.data))
          .catch(() => setSuggestions(null));
      } else {
        setSuggestions(null);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSuggestionClick = (item) => {
    setSelectedResult(item);
    setShowPopup(true);
    setSuggestions(null);
    setQuery("");
  };

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const submitInquiry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await axios.post("/api/inquiries", inquiryForm);
      setSubmitStatus("success");
      setInquiryForm({ name: "", email: "", phone: "", inquiryType: "Product", message: "" });
      setTimeout(() => {
        setShowInquiryModal(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-3" : "py-5"}`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className={`relative px-8 py-3.5 rounded-[2rem] border transition-all duration-500 flex items-center justify-between ${
            isScrolled
              ? "bg-white/90 backdrop-blur-xl border-gray-200/60 shadow-lg shadow-black/[0.04]"
              : "bg-white/70 backdrop-blur-md border-gray-200/40 shadow-sm"
          }`}>

            {/* Logo & Navigation */}
            <div className="flex items-center gap-12">
              <Link to="/l/home" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <img src={Logo} alt="Logo" className="w-full h-full invert brightness-0" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  Chalo <span className="text-blue-600">Khelne</span>
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-1.5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      navigate(`/l/${tab}`);
                    }}
                    className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${
                      activeTab === tab
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => setShowInquiryModal(true)}
                  className="px-5 py-2 rounded-full text-xs font-semibold tracking-wide text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3" /> Inquiry
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex relative group">
                <div className="flex items-center bg-gray-50 border border-gray-200/60 group-focus-within:bg-white group-focus-within:border-blue-300 group-focus-within:shadow-lg transition-all w-48 lg:w-60 rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 mr-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events, venues..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none w-full"
                  />
                </div>

                <AnimatePresence>
                  {suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full mt-3 left-0 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl p-3 z-50 overflow-hidden"
                    >
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Search Results</div>
                      {Object.values(suggestions).every((arr) => arr.length === 0) ? (
                        <div className="p-4 text-xs font-semibold text-gray-400 text-center">No Results Found</div>
                      ) : (
                        <div className="space-y-0.5">
                          {["tournaments", "turfs", "users"].map((key) =>
                            suggestions[key]?.map((item) => (
                              <button
                                key={item._id}
                                className="w-full text-left p-3 rounded-xl hover:bg-gray-50 group transition-all"
                                onClick={() => handleSuggestionClick(item)}
                              >
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{item.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{key.slice(0, -1)}</div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="p-2.5 bg-gray-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  className="lg:hidden p-2.5 bg-gray-100 text-gray-500 rounded-xl transition-all hover:bg-gray-200"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-6 right-6 z-[90] bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 lg:hidden"
          >
            <div className="space-y-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMenuOpen(false);
                    navigate(`/l/${tab}`);
                  }}
                  className={`w-full text-left p-5 rounded-2xl flex items-center justify-between transition-all ${
                    activeTab === tab ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-base font-bold tracking-tight">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <ChevronRight className={`w-5 h-5 ${activeTab === tab ? "opacity-100" : "opacity-20"}`} />
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowInquiryModal(true); setMenuOpen(false); }}
              className="w-full p-5 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              Contact Support <Send className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {showInquiryModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowInquiryModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <button
                onClick={() => setShowInquiryModal(false)}
                className="absolute top-6 right-6 p-2.5 bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-[2px] bg-blue-600 rounded-full" />
                  <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Contact Us</div>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-8">Send an Inquiry</h2>

                {submitStatus === 'success' ? (
                  <div className="py-16 text-center space-y-5">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                      <Send className="w-7 h-7" />
                    </div>
                    <p className="text-xl font-bold tracking-tight text-gray-900">Message Sent</p>
                    <p className="text-gray-500 font-medium text-sm">Our team will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={submitInquiry} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={inquiryForm.name}
                          onChange={handleInquiryChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={inquiryForm.email}
                          onChange={handleInquiryChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Inquiry Type</label>
                      <select
                        name="inquiryType"
                        value={inquiryForm.inquiryType}
                        onChange={handleInquiryChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                      >
                        <option value="Product">General Inquiry</option>
                        <option value="Service">Booking Support</option>
                        <option value="Partnership">Business Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Message</label>
                      <textarea
                        name="message"
                        rows="4"
                        value={inquiryForm.message}
                        onChange={handleInquiryChange}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Send Message <Send className="w-4 h-4" /></>
                      )}
                    </button>
                    {submitStatus === 'error' && (
                      <p className="text-red-500 text-xs font-semibold text-center mt-2">Error sending message — please try again</p>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search Result Popup */}
      {showPopup && selectedResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Details</div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">{selectedResult.name}</h2>
                </div>
                <button onClick={() => setShowPopup(false)} className="p-2.5 bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3">
                {selectedResult.email && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Send className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">{selectedResult.email}</span>
                  </div>
                )}
                {selectedResult.description && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm font-medium text-gray-600 leading-relaxed">{selectedResult.description}</span>
                  </div>
                )}
                {selectedResult.address && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <LayoutGrid className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">{selectedResult.address}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm transition-all hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 overflow-y-auto">
            <Login onClose={() => setShowLogin(false)} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

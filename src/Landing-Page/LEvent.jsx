import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Share2,
  X,
  LogIn,
  UserPlus,
  MapPin,
  Calendar,
  Award,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import Carousel from "./LCarousel.jsx";

// Tournament Detail Modal Component
const TournamentDetailModal = ({ tournament, onClose, onSignInPrompt }) => {
  if (!tournament) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center overflow-y-auto p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        className="bg-white rounded-[3rem] max-w-5xl w-full overflow-hidden relative shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black bg-white/10 hover:bg-white backdrop-blur-md p-3 rounded-full z-50 transition-all border border-white/20 shadow-xl"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Section */}
        <div className="w-full md:w-5/12 h-64 md:h-full relative overflow-hidden">
          <img
            src={`/src/assets/card-img.png`}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-12">
            <div className="space-y-4">
              <span className="px-4 py-2 bg-blue-600 text-[10px] font-black tracking-widest uppercase rounded-full border border-blue-400/50 text-white italic">
                {tournament.type || "Pro Series"}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white italic leading-none uppercase tracking-tighter">
                {tournament.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-gray-50/50">
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: Award, label: "Organizer", value: tournament.organizerName, color: "text-blue-600 bg-blue-50" },
                { icon: MapPin, label: "Venue", value: tournament.eventLocation, color: "text-indigo-600 bg-indigo-50" },
                { icon: Calendar, label: "Schedule", value: new Date(tournament.selectedDate).toDateString(), color: "text-purple-600 bg-purple-50" },
                { icon: IndianRupee, label: "Entry Fee", value: `₹ ${tournament.tournamentFee}/-`, color: "text-green-600 bg-green-50" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${item.color} shadow-sm border border-black/5`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="font-bold text-gray-900 italic">{item.value || "TBD"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] italic">Mission Objective</h3>
              <p className="text-gray-600 font-medium leading-relaxed italic text-lg">
                {tournament.description || "Enter the arena where legends are forged. This high-stakes tournament brings together the finest athletes for a showdown of raw skill and tactical brilliance."}
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tight mb-1">Registration ends soon</h4>
                  <p className="text-gray-400 text-sm font-medium italic">Secure your presence in the tournament bracket today.</p>
                </div>
                <button
                  onClick={onSignInPrompt}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black italic uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  Enlist Now <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] italic">Tournament Protocol</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Arrive 45m before kick-off", "Valid photo identity required", "Professional gear mandatory", "Official rulings are final"].map((rule, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700 italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Sign In Modal Component
const SignInModal = ({ onClose, message }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 40, opacity: 0 }}
        className="bg-white rounded-[3rem] max-w-md w-full p-12 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto shadow-inner">
            <UserPlus className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
              Awaiting Orders
            </h2>
            <p className="text-gray-500 font-medium italic">
              {message || "Authentication required to access the tactical grid and secure your mission slot."}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
            <LogIn className="w-5 h-5" />
            Sign In
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 py-5 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all text-xs"
          >
            Deploy as Guest
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest italic leading-relaxed">
          By engaging, you agree to our <br /> combat protocols & privacy terms.
        </p>
      </motion.div>
    </motion.div>
  );
};

const Event = () => {
  const [searchParams] = useSearchParams();
  const deepLinkedTournamentId = searchParams.get("tournamentId");

  const [TopactiveTab, setTopActiveTab] = useState("event");
  const [activeTab, setActiveTab] = useState("Live");

  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInMessage, setSignInMessage] = useState("");

  const Toptabs = ["event", "score"];
  const tabs = ["Live", "Upcoming", "My Registration", "History"];

  const handleTournamentClick = (tournament) => {
    setSelectedTournament(tournament);
  };

  const handleSignInPrompt = (message) => {
    setSignInMessage(message || "Sign in to access all features and register for tournaments.");
    setShowSignInModal(true);
  };

  // Handle Deep Linking & App Redirection
  useEffect(() => {
    if (deepLinkedTournamentId) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const playStoreLink = "https://play.google.com/store/apps/details?id=com.chalokhelnesport.client";
      const appScheme = `chalokhelne://tournament/details/${deepLinkedTournamentId}`;

      // 1. Logic for Mobile App Redirection
      if (isMobile) {
        const start = Date.now();
        // Try to open the app
        window.location.href = appScheme;

        // Fallback to Play Store if app is not opening/installed
        const timeout = setTimeout(() => {
          // If the tab is still active and visible after 1.2s, assume app isn't installed
          if (!document.hidden && (Date.now() - start < 2000)) {
            window.location.href = playStoreLink;
          }
        }, 1200);

        return () => clearTimeout(timeout);
      }

      // 2. Web Fallback Fetch
      const fetchSingleTournament = async () => {
        try {
          const response = await fetch(`http://localhost:3003/api/tournaments/${deepLinkedTournamentId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.tournament) {
              setSelectedTournament(data.tournament);
            }
          }
        } catch (err) {
          console.error("Deep link error:", err);
        }
      };
      fetchSingleTournament();
    }
  }, [deepLinkedTournamentId]);

  useEffect(() => {
    if (selectedTournament || showSignInModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [selectedTournament, showSignInModal]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <Carousel />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-20">
        {/* Top Navigation Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-[1px] bg-blue-600" />
              <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] italic">Tactical Grid</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
              Tournament <br /> <span className="text-transparent stroke-gray-900 stroke-1">Operations</span>
            </h1>
          </div>

          <div className="flex bg-gray-50 p-2 rounded-[2rem] border border-black/5 self-start">
            {Toptabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setTopActiveTab(tab)}
                className={`px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest italic transition-all ${TopactiveTab === tab ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-16">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${activeTab === tab ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white border-black/10 text-gray-500 hover:border-black/20'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tournament Content */}
        <ModifiedTournamentCards onTournamentClick={handleTournamentClick} />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {deepLinkedTournamentId && !selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center p-5 mb-8 shadow-2xl shadow-blue-500/40 relative"
            >
              <Zap className="w-full h-full text-white animate-pulse" />
              <div className="absolute inset-0 border-2 border-white/20 rounded-[2rem] animate-ping" />
            </motion.div>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
              Launching <span className="text-blue-600">Command Center</span>
            </h2>
            <p className="text-gray-500 font-bold italic uppercase tracking-widest text-[10px] mb-12">
              Initiating Tactical Handshake with ChaloKhelne Mobile
            </p>

            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                />
              ))}
            </div>

            <button
              onClick={() => window.location.href = "https://play.google.com/store/apps/details?id=com.chalokhelnesport.client"}
              className="mt-20 text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-[0.4em] transition-colors"
            >
              Manual Extraction to Play Store
            </button>
          </motion.div>
        )}

        {selectedTournament && (
          <TournamentDetailModal
            tournament={selectedTournament}
            onClose={() => setSelectedTournament(null)}
            onSignInPrompt={() => handleSignInPrompt("Sign in to register.")}
          />
        )}
        {showSignInModal && (
          <SignInModal
            onClose={() => setShowSignInModal(false)}
            message={signInMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ModifiedTournamentCards = ({ onTournamentClick }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("http://localhost:3003/api/tournaments");
        if (!response.ok) throw new Error("Connection Failure");
        const data = await response.json();
        setTournaments(data.tournaments || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[1, 2, 3].map(i => <div key={i} className="h-[500px] rounded-[3rem] bg-gray-50 animate-pulse" />)}
    </div>
  );

  if (error) return <div className="text-center py-20 text-red-500 font-black italic uppercase">Critical Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {tournaments.map((tournament) => (
        <motion.div
          key={tournament._id}
          whileHover={{ y: -10 }}
          className="group relative rounded-[3rem] overflow-hidden bg-white border border-black/5 shadow-2xl shadow-black/5 cursor-pointer"
          onClick={() => onTournamentClick(tournament)}
        >
          <div className="relative h-72 overflow-hidden">
            <img
              src={tournament.tournamentLogo ? `http://localhost:3003/api/uploads/tournaments/${tournament.tournamentLogo.split("\\").pop()}` : "/src/assets/card-img.png"}
              alt={tournament.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />

            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-blue-600/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest italic border border-white/20">
                {tournament.type}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const shareLink = `https://chalokhelne.com/l/event?tournamentId=${tournament._id}`;
                navigator.clipboard.writeText(shareLink);
                alert("Universal Deployment Link Copied!");
              }}
              className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white hover:bg-white hover:text-black transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors">
              {tournament.title}
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500 italic font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="truncate">{tournament.eventLocation}</span>
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{tournament.organizerName}</p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Entry Orders</p>
                <p className="text-xl font-black italic text-gray-900">₹ {tournament.tournamentFee}<span className="text-sm text-gray-400">/-</span></p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Timeline</p>
                <p className="text-xs font-black italic text-gray-700 uppercase">{new Date(tournament.selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Event;

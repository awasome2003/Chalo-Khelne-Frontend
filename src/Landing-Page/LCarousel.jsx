import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Sport → Unsplash action images ─────────────────────────────
const sportImages = {
  Cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
  Football: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80",
  Badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  "Table Tennis": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
  Tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  Volleyball: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
  Chess: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=800&q=80",
  Hockey: "https://images.unsplash.com/photo-1580748142185-8d0c6bf4d396?w=800&q=80",
  Pickleball: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  Kabaddi: "https://images.unsplash.com/photo-1461896836934-bd45ba3a404e?w=800&q=80",
  Carrom: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80",
};

const defaultImg = "https://images.unsplash.com/photo-1461896836934-bd45ba3a404e?w=800&q=80";

const getImage = (slide) => {
  if (slide.tournamentLogo) return slide.tournamentLogo;
  return sportImages[slide.sportsType] || defaultImg;
};

const fallbackSlides = [
  { _id: "f1", title: "State Badminton Championship 2026", sportsType: "Badminton", eventLocation: "Shivaji Sports Complex, Pune", startDate: "2026-04-10", status: "upcoming", tournamentFee: 500 },
  { _id: "f2", title: "Inter-Club Table Tennis League", sportsType: "Table Tennis", eventLocation: "PCMC Indoor Stadium", startDate: "2026-04-05", status: "active", tournamentFee: 0 },
  { _id: "f3", title: "Weekend Cricket Knockout", sportsType: "Cricket", eventLocation: "Balewadi Sports Complex", startDate: "2026-04-15", status: "upcoming", tournamentFee: 300 },
  { _id: "f4", title: "Chess Rapid Open 2026", sportsType: "Chess", eventLocation: "FC Road Chess Café, Pune", startDate: "2026-04-08", status: "upcoming", tournamentFee: 200 },
  { _id: "f5", title: "City Football 5-a-Side", sportsType: "Football", eventLocation: "T12 Sports Turf, Kothrud", startDate: "2026-04-12", status: "upcoming", tournamentFee: 1000 },
];

const formatDate = (d) => {
  if (!d) return "TBD";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function Carousel() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const touchStart = useRef(0);
  const autoRef = useRef(null);

  useEffect(() => {
    axios
      .get("/api/tournaments")
      .then((r) => {
        const list = r.data?.tournaments || r.data || [];
        const arr = Array.isArray(list) && list.length >= 3 ? list.slice(0, 7) : fallbackSlides;
        setSlides(arr);
        setActive(Math.floor(arr.length / 2));
      })
      .catch(() => {
        setSlides(fallbackSlides);
        setActive(2);
      });
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (slides.length === 0) return;
    autoRef.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 4500);
    return () => clearInterval(autoRef.current);
  }, [slides.length]);

  const resetAuto = () => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive((p) => (p + 1) % slides.length);
    }, 4500);
  };

  const prev = () => { setActive((p) => (p - 1 + slides.length) % slides.length); resetAuto(); };
  const next = () => { setActive((p) => (p + 1) % slides.length); resetAuto(); };

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  };

  if (slides.length === 0) return null;

  const getCardStyle = (index) => {
    const n = slides.length;
    let offset = index - active;
    if (offset > n / 2) offset -= n;
    if (offset < -n / 2) offset += n;

    if (offset === 0) {
      return { x: 0, scale: 1, rotateY: 0, z: 30, opacity: 1, zIndex: 10, brightness: 1 };
    }
    if (offset === 1 || offset === -(n - 1)) {
      return { x: 380, scale: 0.82, rotateY: -25, z: -80, opacity: 0.7, zIndex: 5, brightness: 0.5 };
    }
    if (offset === -1 || offset === (n - 1)) {
      return { x: -380, scale: 0.82, rotateY: 25, z: -80, opacity: 0.7, zIndex: 5, brightness: 0.5 };
    }
    if (offset === 2 || offset === -(n - 2)) {
      return { x: 680, scale: 0.65, rotateY: -35, z: -160, opacity: 0.35, zIndex: 2, brightness: 0.3 };
    }
    if (offset === -2 || offset === (n - 2)) {
      return { x: -680, scale: 0.65, rotateY: 35, z: -160, opacity: 0.35, zIndex: 2, brightness: 0.3 };
    }
    return { x: offset > 0 ? 900 : -900, scale: 0.5, rotateY: 0, z: -200, opacity: 0, zIndex: 0, brightness: 0 };
  };

  return (
    <div className="py-24 overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">Featured</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Sports Highlights</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={prev} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Carousel */}
      <div
        className="relative w-full"
        style={{ perspective: "1200px", height: "520px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slides.map((slide, i) => {
          const s = getCardStyle(i);
          const isCenter = i === active;
          const isLive = slide.status === "active";

          return (
            <motion.div
              key={slide._id || i}
              animate={{
                x: s.x,
                scale: s.scale,
                rotateY: s.rotateY,
                z: s.z,
                opacity: s.opacity,
              }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                marginLeft: "-220px",
                width: "440px",
                height: "500px",
                zIndex: s.zIndex,
                transformStyle: "preserve-3d",
                filter: `brightness(${s.brightness})`,
              }}
              onClick={() => {
                if (isCenter) navigate("/l/event");
                else { setActive(i); resetAuto(); }
              }}
              className="cursor-pointer group"
            >
              {/* Card with full image */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                {/* Background Image */}
                <img
                  src={getImage(slide)}
                  alt={slide.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                    isCenter ? "group-hover:scale-105" : ""
                  }`}
                  onError={(e) => { e.target.src = defaultImg; }}
                />

                {/* Gradient overlay — heavy at bottom for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Live pulse glow */}
                {isLive && isCenter && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-red-500/50 animate-pulse pointer-events-none" />
                )}

                {/* Top: Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                  {/* Status */}
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                    isLive
                      ? "bg-red-500/90 text-white"
                      : "bg-white/15 text-white/90"
                  }`}>
                    {isLive && <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />}
                    {isLive ? "Live" : "Upcoming"}
                  </span>

                  {/* Sport tag */}
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm text-white/80">
                    {slide.sportsType || "Sport"}
                  </span>
                </div>

                {/* Bottom: Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-lg sm:text-xl font-bold leading-tight line-clamp-2 mb-3">
                    {slide.title}
                  </h3>

                  <div className="flex items-center gap-4 text-white/60 text-xs mb-4">
                    {slide.eventLocation && (
                      <span className="flex items-center gap-1 truncate">
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        {slide.eventLocation}
                      </span>
                    )}
                    <span className="flex items-center gap-1 shrink-0">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      {formatDate(slide.startDate)}
                    </span>
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${
                      slide.tournamentFee > 0 ? "text-white" : "text-green-400"
                    }`}>
                      {slide.tournamentFee > 0 ? `₹${slide.tournamentFee}` : "Free Entry"}
                    </span>

                    {isCenter && (
                      <span className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white text-xs font-bold rounded-lg transition-colors">
                        Join Now →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); resetAuto(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-brand-500" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

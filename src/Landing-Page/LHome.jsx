import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Layers,
  Play,
  Star,
  Award,
  Timer,
  Shuffle,
  CheckCircle2,
  Sparkles,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Animation Variants ───
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const fadeInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const zoomIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// ─── Sports Data ───
const SPORTS = [
  { name: "Cricket", emoji: "\u{1F3CF}", color: "#16A34A", bg: "from-green-100 to-green-50" },
  { name: "Football", emoji: "\u26BD", color: "#2563EB", bg: "from-blue-100 to-blue-50" },
  { name: "Badminton", emoji: "\u{1F3F8}", color: "#D97706", bg: "from-amber-100 to-amber-50" },
  { name: "Table Tennis", emoji: "\u{1F3D3}", color: "#DC2626", bg: "from-red-100 to-red-50" },
  { name: "Tennis", emoji: "\u{1F3BE}", color: "#65A30D", bg: "from-lime-100 to-lime-50" },
  { name: "Basketball", emoji: "\u{1F3C0}", color: "#EA580C", bg: "from-orange-100 to-orange-50" },
  { name: "Volleyball", emoji: "\u{1F3D0}", color: "#0891B2", bg: "from-cyan-100 to-cyan-50" },
  { name: "Chess", emoji: "\u265F\uFE0F", color: "#7C3AED", bg: "from-violet-100 to-violet-50" },
  { name: "Hockey", emoji: "\u{1F3D1}", color: "#059669", bg: "from-emerald-100 to-emerald-50" },
  { name: "Kabaddi", emoji: "\u{1F93C}", color: "#DB2777", bg: "from-pink-100 to-pink-50" },
  { name: "Pickleball", emoji: "\u{1F3D3}", color: "#0D9488", bg: "from-teal-100 to-teal-50" },
  { name: "Snooker", emoji: "\u{1F3B1}", color: "#4F46E5", bg: "from-indigo-100 to-indigo-50" },
  { name: "Carrom", emoji: "\u{1FA79}", color: "#B45309", bg: "from-yellow-100 to-yellow-50" },
  { name: "Turf Games", emoji: "\u{1F3DF}\uFE0F", color: "#047857", bg: "from-green-100 to-green-50" },
  { name: "Hockey", emoji: "\u{1F3D2}", color: "#0284C7", bg: "from-sky-100 to-sky-50" },
];

const FEATURES = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Rule-Based Engine",
    desc: "Federation-accurate rules for 15+ sports. District to international level configs auto-applied.",
    color: "text-orange-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    hover: "hover:shadow-blue-100",
  },
  {
    icon: <Shuffle className="w-6 h-6" />,
    title: "Multi-Format Tournaments",
    desc: "Group stage, knockout, or both. Sets, innings, halves, quarters \u2014 any game structure.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    hover: "hover:shadow-emerald-100",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Live Scoring",
    desc: "Real-time score tracking with auto-calculated standings, rankings, and leaderboards.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    hover: "hover:shadow-amber-100",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Auto Match Generation",
    desc: "Fixtures, groups, and brackets generated instantly. Round-robin or single elimination.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    hover: "hover:shadow-purple-100",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Sport-Aware Validation",
    desc: "Forms adapt dynamically per sport. No invalid configs \u2014 the system knows the rules.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    hover: "hover:shadow-rose-100",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team & Player Management",
    desc: "Rosters, bookings, group assignments, and seeding \u2014 all in one dashboard.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    hover: "hover:shadow-cyan-100",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Pick Your Sport", desc: "Choose from 15+ sports. Rules auto-load based on your selection.", icon: <Target className="w-7 h-7" /> },
  { step: "02", title: "Configure Tournament", desc: "Set level, format, categories. The engine adapts fields dynamically.", icon: <Layers className="w-7 h-7" /> },
  { step: "03", title: "Add Participants", desc: "Register teams or players. Assign groups, set seeds, manage rosters.", icon: <Users className="w-7 h-7" /> },
  { step: "04", title: "Go Live", desc: "Auto-generate fixtures. Track scores in real-time. Declare winners.", icon: <Play className="w-7 h-7" /> },
];

const STATS = [
  { value: "15+", label: "Sports Supported" },
  { value: "60", label: "Rule Configurations" },
  { value: "4", label: "Tournament Levels" },
  { value: "\u221E", label: "Tournaments Created" },
];

// ─── Floating Sports Orb Component ───
const FloatingSportsOrb = ({ emoji, size, x, y, delay, duration }) => (
  <motion.div
    className="absolute select-none pointer-events-none z-0"
    style={{ left: x, top: y, fontSize: size }}
    animate={{
      y: [0, -25, 0, 15, 0],
      x: [0, 15, -10, 15, 0],
      rotate: [0, 15, -10, 15, 0],
    }}
    transition={{
      duration: duration || 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay || 0,
    }}
  >
    <div className="relative font-black italic">
      <span className="drop-shadow-2xl">{emoji}</span>
    </div>
  </motion.div>
);

// ─── Sporty Badge ───
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-orange-500 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };
  return (
    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 uppercase font-black tracking-wider text-xs border-2 -skew-x-6 shadow-sm ${colors[color] || colors.blue}`}>
      <div className="skew-x-6 flex items-center gap-1.5">
        {children}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════
const LHome = () => {
  const [activeSport, setActiveSport] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSport((prev) => (prev + 1) % SPORTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden font-sans">

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.03)_25%,transparent_25%,transparent_50%,rgba(59,130,246,0.03)_50%,rgba(59,130,246,0.03)_75%,transparent_75%,transparent)] bg-[length:64px_64px]" />
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-100/30 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-100 to-transparent -skew-x-[20deg] origin-top opacity-50 z-0" />
        </div>

        {/* Floating Sports Emojis */}
        <FloatingSportsOrb emoji={"\u{1F3CF}"} size="2.8rem" x="8%" y="22%" delay={0} duration={4} />
        <FloatingSportsOrb emoji={"\u26BD"} size="2.2rem" x="87%" y="18%" delay={1} duration={5} />
        <FloatingSportsOrb emoji={"\u{1F3D3}"} size="1.8rem" x="10%" y="72%" delay={2} duration={4.5} />
        <FloatingSportsOrb emoji={"\u{1F3F8}"} size="2.2rem" x="92%" y="62%" delay={0.5} duration={5.5} />
        <FloatingSportsOrb emoji={"\u{1F3C0}"} size="1.8rem" x="78%" y="78%" delay={1.5} duration={4.8} />
        <FloatingSportsOrb emoji={"\u265F\uFE0F"} size="2rem" x="18%" y="82%" delay={3} duration={6} />
        <FloatingSportsOrb emoji={"\u{1F3D0}"} size="1.6rem" x="52%" y="12%" delay={2.5} duration={5} />
        <FloatingSportsOrb emoji={"\u{1F3D1}"} size="1.8rem" x="68%" y="88%" delay={1.8} duration={4.2} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0 }}>
            <Badge color="blue">
              <Activity className="w-4 h-4" /> Multi-Sport Tournament Engine
            </Badge>
          </motion.div>

          <motion.h1
            className="mt-8 text-5xl sm:text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9]"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <span className="text-gray-900 block translate-x-[-10px]">Build</span>
            <span className="text-gray-900 block translate-x-[10px] mt-2">Tournaments</span>
            <span className="bg-gradient-to-r from-orange-500 via-indigo-600 to-emerald-500 bg-clip-text text-transparent block mt-2 drop-shadow-sm">
              For Any Sport
            </span>
          </motion.h1>

          <motion.p
            className="mt-10 text-lg sm:text-xl font-bold uppercase tracking-wide text-gray-500 max-w-2xl mx-auto leading-relaxed border-l-4 border-orange-500 pl-4 text-left"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            One platform. 15+ sports. Federation-accurate rules that auto-adapt from district to international level. Create, manage, and score.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            <Link
              to="/l/event"
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-600 font-black text-white text-lg uppercase tracking-wider -skew-x-12 shadow-[8px_8px_0px_0px_rgba(234,88,12,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(234,88,12,0.4)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 flex items-center justify-center"
            >
              <div className="skew-x-12 flex items-center gap-3">
                Explore Tournaments
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            <Link
              to="/l/turf-content"
              className="group relative px-10 py-5 bg-white border-4 border-gray-900 font-black text-gray-900 text-lg uppercase tracking-wider -skew-x-12 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] hover:shadow-[12px_12px_0px_0px_rgba(17,24,39,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 flex items-center justify-center"
            >
              <div className="skew-x-12 flex items-center gap-2">
                Book a Venue
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Rotating Sport Ticker */}
          <motion.div
            className="mt-20 inline-flex items-center gap-4 bg-gray-900 text-white px-6 py-3 -skew-x-12 shadow-xl border-l-4 border-orange-500"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
          >
            <div className="skew-x-12 flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest font-black text-gray-400">Now Playing</span>
              <div className="w-1 h-6 bg-gray-700" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeSport}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 font-black uppercase text-lg tracking-wide"
                >
                  <span className="text-2xl drop-shadow-md">{SPORTS[activeSport].emoji}</span>
                  <span style={{ color: SPORTS[activeSport].color }}>
                    {SPORTS[activeSport].name}
                  </span>
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom Striped Line */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]" />
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative py-12 bg-gray-50 border-y-4 border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={zoomIn} className="text-center group border-r-2 border-gray-200 last:border-0 relative">
                <div className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter bg-gradient-to-b from-gray-900 to-gray-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 origin-center">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-2 font-black uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
          >
            <Badge color="green">
              <Zap className="w-3 h-3" /> Powered by Rules
            </Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter">
              Everything a Tournament
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Manager Needs
              </span>
            </h2>
            <div className="w-24 h-2 bg-emerald-500 mx-auto mt-6 -skew-x-12" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FEATURES.map((feature, i) => (
              <motion.div key={i} variants={zoomIn}>
                <div className={`group relative p-8 h-full bg-white border-2 border-gray-100 ${feature.hover} transition-all duration-300 hover:-translate-y-2 hover:-translate-x-1 shadow-[4px_4px_0px_0px_rgba(243,244,246,1)] hover:shadow-[12px_12px_0px_0px_rgba(17,24,39,1)] z-10`}>
                   {/* Background accent */}
                   <div className={`absolute top-0 right-0 w-24 h-24 ${feature.bg} rounded-bl-[40px] -z-10 group-hover:scale-110 transition-transform duration-500 origin-top-right`} />
                   
                   <div className={`w-16 h-16 border-2 ${feature.border} ${feature.bg} flex items-center justify-center ${feature.color} mb-6 -skew-x-12 shadow-sm`}>
                     <div className="skew-x-12">
                       {feature.icon}
                     </div>
                   </div>
                   <h3 className="text-xl font-black uppercase italic text-gray-900 mb-3">{feature.title}</h3>
                   <p className="text-sm font-bold text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SPORT-AWARE VISUAL SECTION ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden border-y-4 border-gray-200">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_2px,transparent_2px,transparent_10px)]" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div {...fadeInLeft} whileInView="animate" initial="initial" viewport={{ once: true }}>
              <Badge color="purple">
                <Target className="w-3 h-3" /> Sport-Aware Intelligence
              </Badge>
              <h2 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight text-gray-900">
                One Form.
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Infinite Sports.
                </span>
              </h2>
              <div className="w-20 h-2 bg-purple-600 mt-6 -skew-x-12" />
              <p className="mt-8 text-gray-600 font-bold text-lg leading-relaxed border-l-4 border-gray-300 pl-4 bg-white/50 p-4 -skew-x-3">
                <span className="block skew-x-3">
                  Select a sport, pick a level — the form rebuilds itself. Cricket shows overs and innings.
                  Badminton shows sets and deuce rules. Football shows halves and penalty shootouts.
                </span>
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "Dynamic fields driven by 60 rule book configs",
                  "Pre-filled defaults you can override",
                  "Add a new sport \u2014 form adapts automatically",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 bg-white p-3 border-2 border-gray-100 shadow-sm -skew-x-6 hover:-translate-y-1 transition-transform"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="skew-x-6 flex items-center justify-center bg-emerald-100 border border-emerald-200 w-10 h-10 shrink-0 shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="skew-x-6 text-gray-800 text-sm font-black uppercase tracking-wide">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Orbiting Sports */}
            <motion.div className="relative" {...fadeInRight} whileInView="animate" initial="initial" viewport={{ once: true }}>
              <div className="relative w-full aspect-square max-w-md mx-auto" style={{ perspective: "1000px" }}>
                {/* Central Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 bg-gradient-to-br from-blue-300/40 to-purple-300/40 blur-[50px] rounded-full" />
                </div>

                {/* Orbiting Items */}
                {SPORTS.slice(0, 8).map((sport, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const radius = 42;
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);

                  return (
                    <motion.div
                      key={sport.name + i}
                      className="absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      animate={{
                        rotateZ: [0, 360],
                      }}
                      transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-white border-2 border-gray-900 flex items-center justify-center hover:scale-125 transition-transform cursor-default -skew-x-12 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{
                          rotateZ: [0, -360],
                        }}
                        transition={{
                          duration: 25,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                         <span className="text-2xl skew-x-12 drop-shadow-md">{sport.emoji}</span>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(17,24,39,1)] flex items-center justify-center -skew-x-12 relative overflow-hidden"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 bg-white opacity-20 -skew-x-12 translate-x-1/2" />
                    <Zap className="w-14 h-14 text-white skew-x-12 drop-shadow-lg" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div className="absolute -left-20 top-20 w-80 h-80 bg-amber-100 rounded-full blur-[100px] opacity-40 z-0" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" {...fadeInUp} whileInView="animate" initial="initial" viewport={{ once: true }}>
            <Badge color="amber">
              <Timer className="w-3 h-3" /> Simple Steps
            </Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter">
              From Zero to
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Live </span>
              in Minutes
            </h2>
            <div className="w-24 h-2 bg-orange-500 mx-auto mt-6 -skew-x-12" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative group">
                <div className="h-full border-2 border-gray-100 bg-white p-8 relative -skew-x-3 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:border-orange-500 group-hover:shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] transition-all duration-300">
                  <div className="skew-x-3">
                    <div className="text-6xl font-black italic text-gray-100/50 group-hover:text-amber-100/50 transition-colors absolute top-2 right-4 -z-10 tracking-tighter">
                      {step.step}
                    </div>

                    <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-orange-500 mb-6 -skew-x-6 shadow-inner">
                      <div className="skew-x-6">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-black uppercase italic text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-sm font-bold text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-6 w-8 h-8 items-center justify-center text-gray-300 z-20 group-hover:text-orange-400 transition-colors duration-300">
                    <ArrowRight className="w-8 h-8 -skew-x-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SPORTS GRID ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y-4 border-gray-200 overflow-hidden">
        {/* Abstract racing stripes background */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_10px,transparent_10px,transparent_20px)]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div className="text-center mb-16" {...fadeInUp} whileInView="animate" initial="initial" viewport={{ once: true }}>
            <Badge color="blue">
              <Award className="w-3 h-3" /> 15+ Sports
            </Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter">
              Every Sport.
              <span className="bg-gradient-to-r from-orange-500 to-emerald-500 bg-clip-text text-transparent"> Every Format.</span>
            </h2>
            <div className="w-24 h-2 bg-blue-500 mx-auto mt-6 -skew-x-12" />
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {SPORTS.map((sport, i) => (
              <motion.div key={sport.name + i} variants={zoomIn}>
                <div
                  className={`group relative p-6 bg-gradient-to-br ${sport.bg} border-2 border-transparent hover:border-gray-900 hover:shadow-[6px_6px_0px_0px_rgba(17,24,39,1)] transition-all duration-300 cursor-default text-center hover:-translate-y-2 hover:-translate-x-1 -skew-x-3 overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-12 h-12 bg-white/30 rounded-bl-full -z-0 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10 skew-x-3 flex flex-col items-center">
                    <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-125 transition-transform duration-300 drop-shadow-md">
                      {sport.emoji}
                    </div>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-700 group-hover:text-gray-900 transition-colors drop-shadow-sm">
                      {sport.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="relative overflow-hidden -skew-x-3 shadow-[16px_16px_0px_0px_rgba(234,88,12,0.3)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[24px_24px_0px_0px_rgba(234,88,12,0.4)]"
            {...zoomIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-indigo-600 to-purple-700" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05),rgba(255,255,255,0.05)_10px,transparent_10px,transparent_20px)] opacity-50" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-24 text-center skew-x-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block bg-white/20 px-6 py-2 uppercase font-black tracking-widest text-white text-xs mb-6 border-l-4 border-white backdrop-blur-md">
                   Final Whistle
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] text-white drop-shadow-md">
                  Ready to Run Your
                  <br />
                  Next Tournament?
                </h2>
                <p className="mt-8 text-blue-50 font-bold text-lg max-w-2xl mx-auto uppercase tracking-wide drop-shadow-sm">
                  Join thousands of organizers who trust our engine for fair, fast, and federation-compliant tournaments.
                </p>
              </motion.div>

              <motion.div
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/l/event"
                  className="group px-10 py-5 bg-white font-black text-orange-600 text-lg uppercase tracking-wider -skew-x-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-300 flex items-center gap-3"
                >
                  <div className="skew-x-12 flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
                <Link
                  to="/l/trainer"
                  className="group px-10 py-5 bg-transparent border-4 border-white font-black text-white text-lg uppercase tracking-wider -skew-x-12 hover:bg-white hover:text-indigo-900 transition-all duration-300"
                >
                  <div className="skew-x-12">
                     Find a Trainer
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
};

export default LHome;

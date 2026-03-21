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
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Animation Variants ───
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    hover: "hover:shadow-blue-100",
  },
  {
    icon: <Shuffle className="w-6 h-6" />,
    title: "Multi-Format Tournaments",
    desc: "Group stage, knockout, or both. Sets, innings, halves, quarters — any game structure.",
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
    desc: "Forms adapt dynamically per sport. No invalid configs — the system knows the rules.",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    hover: "hover:shadow-rose-100",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Team & Player Management",
    desc: "Rosters, bookings, group assignments, and seeding — all in one dashboard.",
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
    className="absolute select-none pointer-events-none"
    style={{ left: x, top: y, fontSize: size }}
    animate={{
      y: [0, -18, 0, 14, 0],
      x: [0, 8, -4, 6, 0],
      rotate: [0, 8, -4, 6, 0],
    }}
    transition={{
      duration: duration || 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay || 0,
    }}
  >
    <div className="relative">
      <span className="drop-shadow-lg">{emoji}</span>
    </div>
  </motion.div>
);

// ─── Light Glass Card ───
const GlassCard = ({ children, className = "" }) => (
  <div className={`relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-500 overflow-hidden ${className}`}>
    {children}
  </div>
);

// ─── Badge ───
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${colors[color] || colors.blue}`}>
      {children}
    </span>
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
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.08),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(59,130,246,0.07) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-purple-100/30 rounded-full blur-[100px]" />
        </div>

        {/* Floating Sports Emojis */}
        <FloatingSportsOrb emoji={"\u{1F3CF}"} size="2.8rem" x="8%" y="22%" delay={0} duration={7} />
        <FloatingSportsOrb emoji={"\u26BD"} size="2.2rem" x="87%" y="18%" delay={1} duration={8} />
        <FloatingSportsOrb emoji={"\u{1F3D3}"} size="1.8rem" x="10%" y="72%" delay={2} duration={6} />
        <FloatingSportsOrb emoji={"\u{1F3F8}"} size="2.2rem" x="92%" y="62%" delay={0.5} duration={7.5} />
        <FloatingSportsOrb emoji={"\u{1F3C0}"} size="1.8rem" x="78%" y="78%" delay={1.5} duration={6.5} />
        <FloatingSportsOrb emoji={"\u265F\uFE0F"} size="2rem" x="18%" y="82%" delay={3} duration={8} />
        <FloatingSportsOrb emoji={"\u{1F3D0}"} size="1.6rem" x="52%" y="12%" delay={2.5} duration={7} />
        <FloatingSportsOrb emoji={"\u{1F3D1}"} size="1.8rem" x="68%" y="88%" delay={1.8} duration={6.8} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0 }}>
            <Badge color="blue">
              <Sparkles className="w-3 h-3" /> Multi-Sport Tournament Engine
            </Badge>
          </motion.div>

          <motion.h1
            className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <span className="text-gray-900">Build Tournaments</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent">
              for Any Sport
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            One platform. 15+ sports. Federation-accurate rules that auto-adapt from
            district to international level. Create, manage, and score — all in real time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            <Link
              to="/l/event"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
            >
              Explore Tournaments
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/l/turf-content"
              className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              Book a Venue
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Rotating Sport Ticker */}
          <motion.div
            className="mt-14 flex items-center justify-center gap-3"
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
          >
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Now playing</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeSport}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm"
              >
                <span className="text-lg">{SPORTS[activeSport].emoji}</span>
                <span className="text-sm font-bold" style={{ color: SPORTS[activeSport].color }}>
                  {SPORTS[activeSport].name}
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STATS.map((stat, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-gray-900 to-gray-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">
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
            <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Everything a Tournament
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Manager Needs
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
              No more spreadsheets. No more guesswork. One engine that understands every sport.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {FEATURES.map((feature, i) => (
              <motion.div key={i} variants={scaleIn}>
                <GlassCard className={`p-6 h-full ${feature.hover}`}>
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center ${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SPORT-AWARE VISUAL SECTION ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div {...fadeInLeft} whileInView="animate" initial="initial" viewport={{ once: true }}>
              <Badge color="purple">
                <Target className="w-3 h-3" /> Sport-Aware Intelligence
              </Badge>
              <h2 className="mt-6 text-3xl sm:text-4xl font-black tracking-tight leading-tight text-gray-900">
                One Form.
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Infinite Sports.
                </span>
              </h2>
              <p className="mt-4 text-gray-500 text-lg leading-relaxed">
                Select a sport, pick a level — the form rebuilds itself. Cricket shows overs and innings.
                Badminton shows sets and deuce rules. Football shows halves and penalty shootouts.
                No code changes needed.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Dynamic fields driven by 60 rule book configs",
                  "Pre-filled defaults you can override",
                  "Add a new sport — form adapts automatically",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-gray-600 text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Orbiting Sports */}
            <motion.div className="relative" {...fadeInRight} whileInView="animate" initial="initial" viewport={{ once: true }}>
              <div className="relative w-full aspect-square max-w-md mx-auto" style={{ perspective: "800px" }}>
                {/* Central Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-[60px]" />
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
                        y: [0, -8, 0, 6, 0],
                        rotateY: [0, 15, 0, -15, 0],
                        rotateX: [0, -5, 0, 5, 0],
                      }}
                      transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3,
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-default"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <span className="text-2xl">{sport.emoji}</span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeInUp} whileInView="animate" initial="initial" viewport={{ once: true }}>
            <Badge color="amber">
              <Timer className="w-3 h-3" /> Simple Steps
            </Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              From Zero to
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"> Live </span>
              in Minutes
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-80px" }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <GlassCard className="p-6 h-full text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-black text-white shadow-lg shadow-blue-500/20">
                      {step.step}
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mt-4 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>

                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200" />
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SPORTS GRID ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" {...fadeInUp} whileInView="animate" initial="initial" viewport={{ once: true }}>
            <Badge color="blue">
              <Award className="w-3 h-3" /> 15+ Sports
            </Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Every Sport.
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent"> Every Format.</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              From racquet games to team sports, board games to field events — one engine rules them all.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {SPORTS.map((sport, i) => (
              <motion.div key={sport.name + i} variants={scaleIn}>
                <div
                  className={`group relative p-5 rounded-2xl bg-gradient-to-br ${sport.bg} border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-500 cursor-default text-center hover:scale-[1.04]`}
                >
                  <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {sport.emoji}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors truncate">
                    {sport.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-3xl"
            {...scaleIn}
            whileInView="animate"
            initial="initial"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-5xl mb-6 block">{"\u{1F3C6}"}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                  Ready to Run Your
                  <br />
                  Next Tournament?
                </h2>
                <p className="mt-4 text-blue-100 text-lg max-w-lg mx-auto">
                  Join thousands of organizers who trust our engine for fair, fast, and federation-compliant tournaments.
                </p>
              </motion.div>

              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/l/event"
                  className="group px-10 py-4 bg-white rounded-2xl font-bold text-blue-600 shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/l/trainer"
                  className="px-10 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-bold text-white hover:bg-white/20 transition-all duration-300"
                >
                  Find a Trainer
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

"use client";

import { motion } from "framer-motion";
import { GradientText } from "@/components/shared/GradientText";
import { ArrowRight, Github, Zap, Star, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const TERMINAL_LINES = [
  { text: "diff --git a/src/auth.ts b/src/auth.ts", color: "text-zinc-400" },
  { text: "@@ -24,6 +24,8 @@ async function handleLogin()", color: "text-zinc-500" },
  { text: "+  const token = req.headers.authorization;", color: "text-emerald-400" },
  { text: "-  const user = await getUser(id);", color: "text-red-400" },
  { text: "+  const user = await getUser(token);", color: "text-emerald-400" },
  { text: "", color: "" },
  { text: "🤖 AI Review: Security Issue Found", color: "text-yellow-400" },
  { text: "⚠️  Line 24: Token not validated before use", color: "text-orange-400" },
  { text: "   Consider using verifyToken() middleware", color: "text-zinc-300" },
  { text: "   Score: 74/100 — Grade: B", color: "text-purple-400" },
];

const STATS = [
  { icon: Zap, label: "Reviews", value: "500+" },
  { icon: Star, label: "Avg Score", value: "87/100" },
  { icon: Shield, label: "Uptime", value: "99.9%" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export function HeroSection() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) return;
    const timer = setTimeout(
      () => setVisibleLines((v) => v + 1),
      visibleLines === 0 ? 1000 : 150
    );
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#09090b]" />
        <motion.div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-600/15 blur-[100px]"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_60%,_#09090b_100%)]" />
      </div>

      <div className="container mx-auto px-4 py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <div className="space-y-8">
          {/* Badge */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              Powered by Claude AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-2"
          >
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white">
              AI-Powered
              <br />
              <GradientText>Code Reviews</GradientText>
              <br />
              For Every PR
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-xl text-zinc-400 max-w-lg leading-relaxed"
          >
            Connect your GitHub repos and get instant, intelligent code reviews
            on every Pull Request — automatically graded and posted as comments.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 group"
            >
              <Github className="h-5 w-5" />
              Start Reviewing PRs
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-zinc-300 font-semibold hover:bg-white/5 hover:border-white/20 transition-all duration-200"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex gap-8 pt-4"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-violet-400" />
                <div>
                  <div className="text-white font-bold">{stat.value}</div>
                  <div className="text-zinc-500 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Terminal preview */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/80 backdrop-blur-sm shadow-2xl shadow-black/50">
            {/* Window controls */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-800/50 border-b border-white/5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">
                code-review-bot • PR #42 analysis
              </span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm space-y-1 min-h-[300px]">
              {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={line.color || "text-zinc-400"}>
                  {line.text}
                </div>
              ))}
              {visibleLines < TERMINAL_LINES.length && (
                <span className="inline-block w-2 h-4 bg-violet-400 cursor-blink" />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

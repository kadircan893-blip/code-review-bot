"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Star,
  ShieldCheck,
  MessageSquareCode,
  Settings2,
  GitPullRequest,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Reviews",
    description:
      "AI analyzes your code changes within seconds of opening a PR. No waiting, no delays.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: Star,
    title: "Smart Scoring",
    description:
      "Every PR gets a quality score (0–100) and a grade from A+ to F with detailed reasoning.",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: ShieldCheck,
    title: "Security Focus",
    description:
      "Automatically detects OWASP Top 10 vulnerabilities, injection risks, and authentication flaws.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: MessageSquareCode,
    title: "Line-Level Comments",
    description:
      "Precise feedback at the exact file and line number — not vague high-level criticism.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Settings2,
    title: "Custom Rules",
    description:
      "Configure focus areas, severity thresholds, and add custom review instructions for your team.",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: GitPullRequest,
    title: "GitHub Native",
    description:
      "Reviews are posted directly as GitHub PR comments. Works with any GitHub repo.",
    gradient: "from-zinc-500/20 to-slate-500/20",
    iconColor: "text-zinc-300",
  },
];

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
            Everything you need
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Supercharge your code review
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            From instant analysis to security scanning — Code Review Bot handles
            the tedious parts so your team can focus on what matters.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`inline-flex p-3 rounded-xl bg-white/5 ${feature.iconColor} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

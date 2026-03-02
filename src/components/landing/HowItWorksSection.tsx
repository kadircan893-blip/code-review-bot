"use client";

import { motion } from "framer-motion";
import { Link2, GitPullRequest, BrainCircuit } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Repo",
    description:
      "Sign in with GitHub and connect any repository you have admin access to. We register a webhook automatically.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    number: "02",
    icon: GitPullRequest,
    title: "Open a Pull Request",
    description:
      "When a contributor opens or updates a PR, GitHub instantly notifies Code Review Bot via webhook.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    number: "03",
    icon: BrainCircuit,
    title: "AI Reviews Instantly",
    description:
      "Claude analyzes every changed file, posts detailed comments, and assigns a quality grade directly to the PR.",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
            Simple setup
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white">
            Up and running in minutes
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            No configuration files, no complex setup — just connect and go.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-fuchsia-500/50" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              {/* Number badge + Icon */}
              <div className="relative">
                <div
                  className={`p-4 rounded-2xl border ${step.bg} ${step.color}`}
                >
                  <step.icon className="h-8 w-8" />
                </div>
                <span className="absolute -top-2 -right-2 text-xs font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full px-1.5 py-0.5">
                  {step.number}
                </span>
              </div>

              <h3 className="text-white font-semibold text-xl">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

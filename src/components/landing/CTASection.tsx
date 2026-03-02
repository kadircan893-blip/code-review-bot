"use client";

import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden p-12 text-center"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-fuchsia-600/30" />
          <div className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-sm" />
          <div className="absolute inset-0 border border-violet-500/20 rounded-3xl" />

          {/* Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-500/30 blur-[60px]" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to ship{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                better code?
              </span>
            </h2>
            <p className="text-zinc-300 text-lg max-w-md mx-auto">
              Start for free. No credit card required. Connect your first repo in
              under 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition-colors duration-200 shadow-xl shadow-black/30 group"
              >
                <Github className="h-5 w-5" />
                Connect with GitHub
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <p className="text-zinc-500 text-sm">
              Open source · MIT License ·{" "}
              <a
                href="https://github.com"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                View on GitHub
              </a>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500 text-sm">
          <p>© 2025 Code Review Bot. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </a>
            <a
              href="https://github.com"
              className="hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

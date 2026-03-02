"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-[120px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-fuchsia-600/15 blur-[100px]"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Code Review Bot</h1>
              <p className="text-zinc-500 text-xs">AI-Powered PR Reviews</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-zinc-400 mt-1">
                Sign in to start reviewing your pull requests with AI.
              </p>
            </div>

            {/* GitHub sign-in button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GitHubIcon />
              )}
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </button>

            {/* Divider info */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
              <p className="text-zinc-400 text-sm font-medium">
                Required permissions:
              </p>
              <ul className="text-zinc-500 text-xs space-y-1">
                <li>• Read repository code (for PR diffs)</li>
                <li>• Post PR review comments</li>
                <li>• Create repository webhooks</li>
              </ul>
            </div>

            <p className="text-zinc-600 text-xs text-center">
              By signing in, you agree to our{" "}
              <a href="#" className="text-zinc-400 hover:text-white transition-colors underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-zinc-400 hover:text-white transition-colors underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

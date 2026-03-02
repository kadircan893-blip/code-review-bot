"use client";

import { motion } from "framer-motion";
import { Star, GitPullRequest, TrendingUp, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats?: {
    totalReviews: number;
    weeklyPRs: number;
    averageScore: number | null;
    connectedRepos: number;
  };
  isLoading?: boolean;
}

const CARDS = [
  {
    key: "totalReviews" as const,
    label: "Total Reviews",
    icon: Star,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "weeklyPRs" as const,
    label: "PRs This Week",
    icon: GitPullRequest,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "averageScore" as const,
    label: "Avg Score",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    format: (v: number | null) => (v !== null ? `${v.toFixed(1)}/100` : "—"),
  },
  {
    key: "connectedRepos" as const,
    label: "Connected Repos",
    icon: Database,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    format: (v: number) => v.toLocaleString(),
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? null;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm">{card.label}</span>
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
            </div>

            {isLoading ? (
              <div className="h-7 w-20 rounded-md shimmer" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {card.key === "averageScore"
                  ? card.format(value as number | null)
                  : card.format((value ?? 0) as number)}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

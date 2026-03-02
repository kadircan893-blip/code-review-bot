"use client";

import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/types/review";
import { Loader2, CheckCircle2, XCircle, Clock, SkipForward } from "lucide-react";

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; color: string; icon: React.ElementType; animate?: boolean }
> = {
  PENDING: {
    label: "Queued",
    color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    icon: Clock,
  },
  RUNNING: {
    label: "Reviewing…",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    icon: Loader2,
    animate: true,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
  SKIPPED: {
    label: "Skipped",
    color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
    icon: SkipForward,
  },
};

interface ReviewStatusProps {
  status: ReviewStatus;
  size?: "sm" | "md";
}

export function ReviewStatusBadge({ status, size = "md" }: ReviewStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-lg border",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1",
        config.color
      )}
    >
      <Icon className={cn("h-3 w-3", config.animate && "animate-spin")} />
      {config.label}
    </span>
  );
}

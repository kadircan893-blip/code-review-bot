"use client";

import { cn } from "@/lib/utils";
import { GRADE_BG_COLORS } from "@/types/review";

interface ScoreBadgeProps {
  score: number | null;
  grade: string | null;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

export function ScoreBadge({
  score,
  grade,
  size = "md",
  showScore = true,
}: ScoreBadgeProps) {
  if (!grade && score === null) return null;

  const gradeClass = grade ? GRADE_BG_COLORS[grade] : "bg-zinc-700/10 text-zinc-400 border-zinc-700/20";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Grade badge */}
      <span
        className={cn(
          "inline-flex items-center font-bold rounded-lg border",
          sizeClasses[size],
          gradeClass
        )}
      >
        {grade ?? "?"}
      </span>

      {/* Score */}
      {showScore && score !== null && (
        <span className="text-zinc-400 text-sm">
          {score.toFixed(0)}<span className="text-zinc-600">/100</span>
        </span>
      )}
    </div>
  );
}

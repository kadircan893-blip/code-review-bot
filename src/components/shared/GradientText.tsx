"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className,
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        animate
          ? "bg-[length:200%_200%] animate-gradient-shift"
          : "",
        "bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400",
        className
      )}
    >
      {children}
    </span>
  );
}

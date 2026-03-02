"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewComment } from "@prisma/client";
import { SEVERITY_COLORS, CATEGORY_LABELS } from "@/types/review";

interface CommentListProps {
  comments: ReviewComment[];
}

const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

export function CommentList({ comments }: CommentListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-zinc-400">No issues found in this review.</p>
      </div>
    );
  }

  // Group by severity
  const grouped = SEVERITY_ORDER.reduce(
    (acc, sev) => {
      const items = comments.filter((c) => c.severity === sev);
      if (items.length > 0) acc[sev] = items;
      return acc;
    },
    {} as Record<string, ReviewComment[]>
  );

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([severity, items]) => (
        <div key={severity}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-md border",
                SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
              )}
            >
              {severity}
            </span>
            <span className="text-zinc-500 text-sm">{items.length} issue{items.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="space-y-2">
            {items.map((comment) => {
              const isExpanded = expandedIds.has(comment.id);
              return (
                <div
                  key={comment.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggle(comment.id)}
                    className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={cn(
                          "inline-flex text-xs font-medium px-1.5 py-0.5 rounded border mt-0.5 flex-shrink-0",
                          SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
                        )}
                      >
                        {(CATEGORY_LABELS as Record<string, string>)[comment.category] ?? comment.category}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm">{comment.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FileCode className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                          <span className="text-zinc-500 text-xs font-mono truncate">
                            {comment.path}{comment.line ? `:${comment.line}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                    )}
                  </button>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                      <p className="text-zinc-300 text-sm leading-relaxed pt-3">
                        {comment.body}
                      </p>

                      {comment.suggestion && (
                        <div className="rounded-lg overflow-hidden border border-white/10">
                          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10">
                            <span className="text-xs text-zinc-400 font-mono">Suggested fix</span>
                          </div>
                          <pre className="p-3 text-xs text-zinc-300 overflow-x-auto font-mono bg-zinc-900/50">
                            {comment.suggestion}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

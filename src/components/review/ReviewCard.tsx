"use client";

import Link from "next/link";
import { GitPullRequest, Plus, Minus, MessageSquare, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ScoreBadge } from "./ScoreBadge";
import { ReviewStatusBadge } from "./ReviewStatus";
import type { ReviewStatus } from "@/types/review";

interface ReviewCardProps {
  review: {
    id: string;
    status: ReviewStatus;
    score: number | null;
    grade: string | null;
    createdAt: Date | string;
    completedAt: Date | string | null;
    _count?: { comments: number };
    pullRequest: {
      githubPrId: number;
      title: string;
      baseBranch: string;
      headBranch: string;
      additions: number;
      deletions: number;
      htmlUrl: string;
      repository: {
        fullName: string;
        name: string;
      };
    };
  };
}

function CardContent({ review, pr }: { review: ReviewCardProps["review"]; pr: ReviewCardProps["review"]["pullRequest"] }) {
  const isCompleted = review.status === "COMPLETED";
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 mt-0.5">
            <GitPullRequest className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-zinc-500 text-xs font-medium">
                {pr.repository.fullName}
              </span>
              <span className="text-zinc-600">#</span>
              <span className="text-zinc-500 text-xs">{pr.githubPrId}</span>
            </div>
            <p className="text-white font-medium text-sm truncate group-hover:text-violet-300 transition-colors">
              {pr.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isCompleted && (
            <ScoreBadge score={review.score} grade={review.grade} size="sm" />
          )}
          <ReviewStatusBadge status={review.status} size="sm" />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <code className="text-zinc-600">{pr.headBranch}</code>
          <span>→</span>
          <code className="text-zinc-600">{pr.baseBranch}</code>
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <Plus className="h-3 w-3" />
          {pr.additions}
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <Minus className="h-3 w-3" />
          {pr.deletions}
        </span>
        {review._count && review._count.comments > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {review._count.comments} issues
          </span>
        )}
        <span className="ml-auto">{formatRelativeTime(review.createdAt)}</span>
        <a
          href={pr.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  const pr = review.pullRequest;
  const isCompleted = review.status === "COMPLETED";
  const cls = "block group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200";

  if (isCompleted) {
    return (
      <Link href={`/reviews/${review.id}`} className={cls}>
        <CardContent review={review} pr={pr} />
      </Link>
    );
  }

  return (
    <div className={cls}>
      <CardContent review={review} pr={pr} />
    </div>
  );
}

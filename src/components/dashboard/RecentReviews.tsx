"use client";

import Link from "next/link";
import { GitPullRequest, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { ScoreBadge } from "@/components/review/ScoreBadge";
import { ReviewStatusBadge } from "@/components/review/ReviewStatus";
import type { ReviewStatus } from "@/types/review";

interface RecentReviewItem {
  id: string;
  status: ReviewStatus;
  score: number | null;
  grade: string | null;
  createdAt: Date | string;
  pullRequest: {
    title: string;
    githubPrId: number;
    repository: { fullName: string };
  };
}

interface RecentReviewsProps {
  reviews?: RecentReviewItem[];
  isLoading?: boolean;
}

export function RecentReviews({ reviews, isLoading }: RecentReviewsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">Recent Reviews</h3>
        <Link
          href="/reviews"
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg shimmer" />
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="py-8 text-center">
          <GitPullRequest className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No reviews yet</p>
          <p className="text-zinc-600 text-xs mt-1">
            Connect a repo and open a PR to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GitPullRequest className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200 truncate group-hover:text-white transition-colors">
                    {review.pullRequest.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {review.pullRequest.repository.fullName} ·{" "}
                    {formatRelativeTime(review.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {review.status === "COMPLETED" ? (
                  <ScoreBadge
                    score={review.score}
                    grade={review.grade}
                    size="sm"
                    showScore={false}
                  />
                ) : (
                  <ReviewStatusBadge status={review.status} size="sm" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw, Plus, Minus, GitPullRequest } from "lucide-react";
import { useReview, useRetryReview } from "@/hooks/useReviews";
import { ScoreBadge } from "@/components/review/ScoreBadge";
import { ReviewStatusBadge } from "@/components/review/ReviewStatus";
import { CommentList } from "@/components/review/CommentList";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { ReviewComment } from "@prisma/client";
import type { ReviewStatus } from "@/types/review";

interface Props {
  params: Promise<{ reviewId: string }>;
}

export default function ReviewDetailPage({ params }: Props) {
  const { reviewId } = use(params);
  const { data, isLoading, refetch } = useReview(reviewId);
  const retry = useRetryReview();

  const review = data as {
    id: string;
    status: ReviewStatus;
    score: number | null;
    grade: string | null;
    summary: string | null;
    rawResponse: string | null;
    errorMessage: string | null;
    promptTokens: number | null;
    completionTokens: number | null;
    model: string;
    createdAt: string;
    completedAt: string | null;
    comments: ReviewComment[];
    pullRequest: {
      id: string;
      githubPrId: number;
      title: string;
      body: string | null;
      authorLogin: string;
      baseBranch: string;
      headBranch: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      htmlUrl: string;
      state: string;
      repository: {
        fullName: string;
        name: string;
        owner: string;
      };
    };
  } | null;

  async function handleRetry() {
    try {
      await retry.mutateAsync(reviewId);
      toast.success("Review restarted");
      setTimeout(() => refetch(), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to retry");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg shimmer" />
        <div className="h-32 rounded-xl shimmer" />
        <div className="h-64 rounded-xl shimmer" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400">Review not found.</p>
        <Link href="/reviews" className="text-violet-400 hover:underline mt-2 inline-block">
          Back to Reviews
        </Link>
      </div>
    );
  }

  const pr = review.pullRequest;

  let highlights: string[] = [];
  if (review.rawResponse) {
    try {
      const raw = JSON.parse(review.rawResponse) as { highlights?: string[] };
      highlights = raw.highlights ?? [];
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/reviews"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Reviews
      </Link>

      {/* PR Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
              <GitPullRequest className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-zinc-500 text-sm">{pr.repository.fullName}</span>
                <span className="text-zinc-600 text-sm">#{pr.githubPrId}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{pr.title}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-500">
                <span>by <span className="text-zinc-300">{pr.authorLogin}</span></span>
                <code className="text-zinc-400">{pr.headBranch}</code>
                <span>→</span>
                <code className="text-zinc-400">{pr.baseBranch}</code>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Plus className="h-3 w-3" />{pr.additions}
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <Minus className="h-3 w-3" />{pr.deletions}
                </span>
                <span>{pr.changedFiles} files</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <ReviewStatusBadge status={review.status} />
            {review.status === "COMPLETED" && (
              <ScoreBadge score={review.score} grade={review.grade} size="lg" />
            )}
            <a
              href={pr.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              View on GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Review summary & highlights */}
      {review.status === "COMPLETED" && (
        <>
          {review.summary && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="text-white font-semibold mb-3">Summary</h3>
              <p className="text-zinc-300 leading-relaxed">{review.summary}</p>
            </div>
          )}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="text-white font-semibold mb-3">✨ What&apos;s Good</h3>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Issues Found ({review.comments.length})
            </h3>
            <CommentList comments={review.comments} />
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
              <span>Model: <code className="text-zinc-400">{review.model}</code></span>
              {review.promptTokens && (
                <span>Input tokens: <span className="text-zinc-400">{review.promptTokens.toLocaleString()}</span></span>
              )}
              {review.completionTokens && (
                <span>Output tokens: <span className="text-zinc-400">{review.completionTokens.toLocaleString()}</span></span>
              )}
              {review.completedAt && (
                <span>Completed: <span className="text-zinc-400">{formatRelativeTime(review.completedAt)}</span></span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Failed state */}
      {review.status === "FAILED" && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h3 className="text-red-400 font-semibold mb-2">Review Failed</h3>
          <p className="text-zinc-300 text-sm mb-4">
            {review.errorMessage ?? "An unknown error occurred."}
          </p>
          <button
            onClick={handleRetry}
            disabled={retry.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${retry.isPending ? "animate-spin" : ""}`} />
            {retry.isPending ? "Retrying…" : "Retry Review"}
          </button>
        </div>
      )}

      {/* Pending / Running state */}
      {(review.status === "PENDING" || review.status === "RUNNING") && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
          <div className="h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-300 font-medium">
            {review.status === "PENDING" ? "Review queued, waiting to start…" : "AI is reviewing your code…"}
          </p>
          <p className="text-zinc-500 text-sm mt-1">This usually takes 15–60 seconds.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Refresh status
          </button>
        </div>
      )}
    </div>
  );
}

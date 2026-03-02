"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Globe, Lock, GitPullRequest, Plus, Minus } from "lucide-react";
import { useRepository, useSyncRepository } from "@/hooks/useRepositories";
import { ReviewStatusBadge } from "@/components/review/ReviewStatus";
import { ScoreBadge } from "@/components/review/ScoreBadge";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import type { ReviewStatus } from "@/types/review";

interface Props {
  params: Promise<{ repoId: string }>;
}

export default function RepositoryDetailPage({ params }: Props) {
  const { repoId } = use(params);
  const { data, isLoading } = useRepository(repoId);
  const sync = useSyncRepository();

  const repo = data as {
    id: string;
    name: string;
    fullName: string;
    owner: string;
    description: string | null;
    isPrivate: boolean;
    defaultBranch: string;
    webhookId: number | null;
    lastActivityAt: string;
    pullRequests: {
      id: string;
      githubPrId: number;
      title: string;
      authorLogin: string;
      baseBranch: string;
      headBranch: string;
      additions: number;
      deletions: number;
      state: string;
      htmlUrl: string;
      updatedAt: string;
      reviews: { id: string; status: ReviewStatus; score: number | null; grade: string | null; createdAt: string }[];
    }[];
  } | null;

  async function handleSync() {
    try {
      const result = await sync.mutateAsync(repoId) as { data: { synced: number } };
      toast.success(`Synced ${result.data.synced} pull requests`);
    } catch {
      toast.error("Failed to sync");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg shimmer" />
        <div className="h-24 rounded-xl shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400">Repository not found.</p>
        <Link href="/repositories" className="text-violet-400 hover:underline mt-2 inline-block">
          Back to Repositories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/repositories"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Repositories
      </Link>

      {/* Repo header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {repo.isPrivate ? (
              <Lock className="h-5 w-5 text-zinc-400 mt-0.5" />
            ) : (
              <Globe className="h-5 w-5 text-zinc-400 mt-0.5" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{repo.name}</h2>
              <p className="text-zinc-500 text-sm">{repo.fullName}</p>
              {repo.description && (
                <p className="text-zinc-400 text-sm mt-2">{repo.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                <span>Default: <code className="text-zinc-400">{repo.defaultBranch}</code></span>
                <span>·</span>
                <span className={`px-2 py-0.5 rounded-full border ${repo.webhookId ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  Webhook {repo.webhookId ? "active" : "inactive"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={sync.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${sync.isPending ? "animate-spin" : ""}`} />
            Sync PRs
          </button>
        </div>
      </div>

      {/* PRs list */}
      <div>
        <h3 className="text-white font-semibold mb-3">Pull Requests ({repo.pullRequests.length})</h3>

        {repo.pullRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <GitPullRequest className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No pull requests yet. Sync or open a PR.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {repo.pullRequests.map((pr) => {
              const latestReview = pr.reviews[0] ?? null;
              return (
                <div
                  key={pr.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <GitPullRequest className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <a
                          href={pr.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white text-sm font-medium hover:text-violet-300 transition-colors truncate block"
                        >
                          {pr.title}
                        </a>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                          <span>#{pr.githubPrId}</span>
                          <span>by {pr.authorLogin}</span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Plus className="h-3 w-3" />{pr.additions}
                          </span>
                          <span className="flex items-center gap-1 text-red-400">
                            <Minus className="h-3 w-3" />{pr.deletions}
                          </span>
                          <span>{formatRelativeTime(pr.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {latestReview ? (
                        latestReview.status === "COMPLETED" ? (
                          <Link href={`/reviews/${latestReview.id}`}>
                            <ScoreBadge score={latestReview.score} grade={latestReview.grade} size="sm" />
                          </Link>
                        ) : (
                          <ReviewStatusBadge status={latestReview.status} size="sm" />
                        )
                      ) : (
                        <span className="text-xs text-zinc-600">No review</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

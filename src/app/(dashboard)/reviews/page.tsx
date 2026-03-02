"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useReviews } from "@/hooks/useReviews";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/types/review";

const STATUSES: { value: ReviewStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "RUNNING", label: "Running" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "SKIPPED", label: "Skipped" },
];

const GRADES = ["", "A+", "A", "B+", "B", "C", "D", "F"];

export default function ReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") as ReviewStatus | null;
  const grade = searchParams.get("grade");
  const page = parseInt(searchParams.get("page") ?? "1");

  const { data, isLoading } = useReviews({
    status: status ?? undefined,
    grade: grade ?? undefined,
    page,
    limit: 20,
  });

  const result = data as {
    items: object[];
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/reviews?${params}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Reviews</h2>
        <p className="text-zinc-400 mt-1">All AI code reviews across your repositories.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setParam("status", s.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                (status ?? "") === s.value
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Grade filter */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setParam("grade", g)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-all",
                (grade ?? "") === g
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {g || "All grades"}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {result && (
        <p className="text-zinc-500 text-sm">
          {result.total} review{result.total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Review list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      ) : !result?.items?.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center">
          <Star className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No reviews found</h3>
          <p className="text-zinc-400 text-sm">
            {status || grade
              ? "Try adjusting the filters above."
              : "Reviews appear here once a PR is opened in a connected repo."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(result.items as Parameters<typeof ReviewCard>[0]["review"][]).map((review) => (
            <ReviewCard key={(review as { id: string }).id} review={review as Parameters<typeof ReviewCard>[0]["review"]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setParam("page", String(page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-zinc-400 text-sm">
            Page {page} of {result.totalPages}
          </span>
          <button
            onClick={() => setParam("page", String(page + 1))}
            disabled={!result.hasNextPage}
            className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

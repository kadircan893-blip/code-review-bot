"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ReviewFilterInput } from "@/types/api";

const QUERY_KEY = ["reviews"] as const;

async function fetchReviews(filters: Partial<ReviewFilterInput> = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.grade) params.set("grade", filters.grade);
  if (filters.repositoryId) params.set("repositoryId", filters.repositoryId);

  const res = await fetch(`/api/reviews?${params}`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const json = await res.json();
  return json.data;
}

async function fetchReview(reviewId: string) {
  const res = await fetch(`/api/reviews/${reviewId}`);
  if (!res.ok) throw new Error("Failed to fetch review");
  const json = await res.json();
  return json.data;
}

export function useReviews(filters: Partial<ReviewFilterInput> = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => fetchReviews(filters),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useReview(reviewId: string | null | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, reviewId],
    queryFn: () => fetchReview(reviewId!),
    enabled: !!reviewId,
    staleTime: 30 * 1000,
  });
}

export function useRetryReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/reviews/${reviewId}/retry`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to retry review");
      }
      return res.json();
    },
    onSuccess: (_data, reviewId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, reviewId] });
    },
  });
}

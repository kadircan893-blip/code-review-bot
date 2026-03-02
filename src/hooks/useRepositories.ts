"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

const QUERY_KEY = ["repositories"] as const;

async function fetchRepositories() {
  const res = await fetch("/api/repositories");
  if (!res.ok) throw new Error("Failed to fetch repositories");
  const json = await res.json();
  return json.data;
}

async function fetchRepository(repoId: string) {
  const res = await fetch(`/api/repositories/${repoId}`);
  if (!res.ok) throw new Error("Failed to fetch repository");
  const json = await res.json();
  return json.data;
}

export function useRepositories(): UseQueryResult {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRepositories,
    staleTime: 60 * 1000,
  });
}

export function useRepository(repoId: string): UseQueryResult {
  return useQuery({
    queryKey: [...QUERY_KEY, repoId],
    queryFn: () => fetchRepository(repoId),
    enabled: !!repoId,
    staleTime: 60 * 1000,
  });
}

export function useConnectRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (githubRepoFullName: string) => {
      const res = await fetch("/api/repositories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubRepoFullName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to connect repository");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDisconnectRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repoId: string) => {
      const res = await fetch(`/api/repositories/${repoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to disconnect repository");
      return res.json();
    },
    onMutate: async (repoId: string) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old: unknown) =>
        (Array.isArray(old) ? old : []).filter((r: unknown) => (r as { id: string }).id !== repoId)
      );
      return { previous };
    },
    onError: (_err, _repoId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useSyncRepository() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repoId: string) => {
      const res = await fetch(`/api/repositories/${repoId}/sync`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to sync repository");
      return res.json();
    },
    onSuccess: (_data, repoId) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, repoId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

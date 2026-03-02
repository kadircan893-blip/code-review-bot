"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateSettingsInput } from "@/types/api";

const QUERY_KEY = ["settings"] as const;

async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  const json = await res.json();
  return json.data;
}

async function updateSettings(data: UpdateSettingsInput) {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update settings");
  }
  const json = await res.json();
  return json.data;
}

export function useSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData(QUERY_KEY);
      queryClient.setQueryData(QUERY_KEY, (old: object) => ({
        ...old,
        ...newSettings,
        focusAreas: Array.isArray(newSettings.focusAreas)
          ? newSettings.focusAreas.join(",")
          : (old as { focusAreas?: string })?.focusAreas,
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
      toast.error("Failed to save settings");
    },
    onSuccess: () => {
      toast.success("Settings saved");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

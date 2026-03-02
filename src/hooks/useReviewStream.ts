"use client";

import { useState, useEffect, useCallback } from "react";

interface StreamEvent {
  type: "status" | "complete" | "error";
  status?: string;
  score?: number | null;
  grade?: string | null;
}

interface ReviewStreamState {
  status: string | null;
  score: number | null;
  grade: string | null;
  events: StreamEvent[];
  isConnected: boolean;
}

export function useReviewStream(reviewId: string | null | undefined) {
  const [state, setState] = useState<ReviewStreamState>({
    status: null,
    score: null,
    grade: null,
    events: [],
    isConnected: false,
  });

  const connect = useCallback(() => {
    if (!reviewId) return;

    const es = new EventSource(`/api/reviews/${reviewId}/stream`);

    setState((prev) => ({ ...prev, isConnected: true }));

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StreamEvent;
        setState((prev) => ({
          ...prev,
          status: data.status ?? prev.status,
          score: data.score ?? prev.score,
          grade: data.grade ?? prev.grade,
          events: [...prev.events, data],
        }));

        // Close when terminal state reached
        if (
          data.status === "COMPLETED" ||
          data.status === "FAILED" ||
          data.status === "SKIPPED"
        ) {
          es.close();
          setState((prev) => ({ ...prev, isConnected: false }));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      setState((prev) => ({ ...prev, isConnected: false }));
    };

    return es;
  }, [reviewId]);

  useEffect(() => {
    const es = connect();
    return () => {
      es?.close();
    };
  }, [connect]);

  return state;
}

import { z } from "zod";

// ─── Generic API Response ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: string;
  details?: unknown;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// ─── Repository Schemas ───────────────────────────────────────────────────────

export const ConnectRepoSchema = z.object({
  githubRepoFullName: z
    .string()
    .min(1)
    .regex(/^[\w.-]+\/[\w.-]+$/, "Must be in format owner/repo"),
});

export type ConnectRepoInput = z.infer<typeof ConnectRepoSchema>;

// ─── Settings Schemas ─────────────────────────────────────────────────────────

export const UpdateSettingsSchema = z.object({
  reviewOnDraft: z.boolean().optional(),
  autoPostComments: z.boolean().optional(),
  minChangedFiles: z.number().int().min(1).max(100).optional(),
  maxDiffLines: z.number().int().min(100).max(10000).optional(),
  focusAreas: z
    .array(
      z.enum([
        "bugs",
        "security",
        "performance",
        "style",
        "maintainability",
        "documentation",
        "tests",
      ])
    )
    .optional(),
  severityThreshold: z
    .enum(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  customInstructions: z.string().max(2000).nullable().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// ─── Review Schemas ───────────────────────────────────────────────────────────

export const RetryReviewSchema = z.object({
  reviewId: z.string().cuid(),
});

export type RetryReviewInput = z.infer<typeof RetryReviewSchema>;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Review Filter Schema ─────────────────────────────────────────────────────

export const ReviewFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "SKIPPED"])
    .optional(),
  grade: z.string().optional(),
  repositoryId: z.string().optional(),
});

export type ReviewFilterInput = z.infer<typeof ReviewFilterSchema>;

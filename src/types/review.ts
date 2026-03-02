import type {
  Review,
  ReviewComment,
  PullRequest,
  Repository,
} from "@prisma/client";

// String literal types (SQLite doesn't support enums)
export type ReviewStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
export type CommentCategory = "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "MAINTAINABILITY" | "DOCUMENTATION" | "TEST_COVERAGE" | "GENERAL";
export type CommentSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ─── Extended Types with Relations ───────────────────────────────────────────

export type ReviewWithComments = Review & {
  comments: ReviewComment[];
};

export type ReviewWithRelations = Review & {
  comments: ReviewComment[];
  pullRequest: PullRequest & {
    repository: Repository;
  };
};

export type RepositoryWithStats = Repository & {
  _count: {
    pullRequests: number;
  };
  pullRequests: (PullRequest & {
    reviews: Pick<Review, "id" | "status" | "score" | "grade" | "createdAt">[];
  })[];
};

export type PullRequestWithLatestReview = PullRequest & {
  repository: Repository;
  reviews: Review[];
  latestReview: Review | null;
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalReviews: number;
  weeklyPRs: number;
  averageScore: number | null;
  connectedRepos: number;
  reviewsByStatus: Record<ReviewStatus, number>;
  recentActivity: ActivityPoint[];
}

export interface ActivityPoint {
  date: string;
  reviews: number;
  avgScore: number | null;
}

// ─── Review Grade Colors ──────────────────────────────────────────────────────

export const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-400",
  A: "text-emerald-500",
  "B+": "text-yellow-400",
  B: "text-yellow-500",
  "C+": "text-orange-400",
  C: "text-orange-500",
  D: "text-red-400",
  F: "text-red-600",
};

export const GRADE_BG_COLORS: Record<string, string> = {
  "A+": "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  A: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "B+": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  B: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "C+": "bg-orange-400/10 text-orange-400 border-orange-400/20",
  C: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  D: "bg-red-400/10 text-red-400 border-red-400/20",
  F: "bg-red-600/10 text-red-600 border-red-600/20",
};

// ─── Severity Colors ─────────────────────────────────────────────────────────

export const SEVERITY_COLORS: Record<CommentSeverity, string> = {
  INFO: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  LOW: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  HIGH: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  CRITICAL: "text-red-400 bg-red-400/10 border-red-400/20",
};

export const CATEGORY_LABELS: Record<CommentCategory, string> = {
  BUG: "Bug",
  SECURITY: "Security",
  PERFORMANCE: "Performance",
  STYLE: "Style",
  MAINTAINABILITY: "Maintainability",
  DOCUMENTATION: "Documentation",
  TEST_COVERAGE: "Test Coverage",
  GENERAL: "General",
};

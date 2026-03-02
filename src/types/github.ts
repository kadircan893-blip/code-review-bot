// ─── GitHub API Types ─────────────────────────────────────────────────────────

export interface GitHubRepo {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface PRFile {
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  blobUrl: string;
}

export interface PRDetails {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  merged: boolean;
  draft: boolean;
  user: {
    login: string;
    avatarUrl: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  additions: number;
  deletions: number;
  changedFiles: number;
  htmlUrl: string;
}

// ─── Webhook Payload Types ────────────────────────────────────────────────────

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubPRHead {
  ref: string;
  sha: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  draft: boolean;
  merged: boolean;
  merged_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  html_url: string;
  diff_url: string;
  user: GitHubUser;
  base: GitHubPRHead;
  head: GitHubPRHead;
}

export interface GitHubRepository {
  id: number;
  full_name: string;
  name: string;
  private: boolean;
  owner: GitHubUser;
  default_branch: string;
}

export interface GitHubPRWebhookPayload {
  action:
    | "opened"
    | "closed"
    | "reopened"
    | "synchronize"
    | "edited"
    | "labeled"
    | "unlabeled"
    | "review_requested"
    | "review_request_removed"
    | "ready_for_review"
    | "converted_to_draft"
    | "assigned"
    | "unassigned";
  number: number;
  pull_request: GitHubPullRequest;
  repository: GitHubRepository;
  sender: GitHubUser;
  installation?: {
    id: number;
  };
}

export type WebhookPayload =
  | { event: "pull_request"; data: GitHubPRWebhookPayload }
  | { event: "ping"; data: { zen: string; hook_id: number } };

export const REVIEWABLE_PR_ACTIONS = [
  "opened",
  "synchronize",
  "reopened",
] as const;

export type ReviewablePRAction = (typeof REVIEWABLE_PR_ACTIONS)[number];

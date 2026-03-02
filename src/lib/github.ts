import { Octokit } from "@octokit/rest";
import type { GitHubRepo, PRFile, PRDetails } from "@/types/github";

/**
 * Returns an authenticated Octokit instance for the given access token.
 */
export function getOctokit(accessToken: string): Octokit {
  return new Octokit({
    auth: accessToken,
    userAgent: "code-review-bot/1.0",
  });
}

/**
 * Fetches all repositories where the user has admin access.
 */
export async function getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const octokit = getOctokit(accessToken);
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: "updated",
      affiliation: "owner,collaborator,organization_member",
    });

    if (data.length === 0) break;

    repos.push(
      ...data
        .filter((r) => r.permissions?.admin === true)
        .map((r) => ({
          id: r.id,
          fullName: r.full_name,
          name: r.name,
          owner: r.owner.login,
          description: r.description ?? null,
          isPrivate: r.private,
          defaultBranch: r.default_branch,
          htmlUrl: r.html_url,
          language: r.language ?? null,
          stargazersCount: r.stargazers_count ?? 0,
          forksCount: r.forks_count ?? 0,
          permissions: r.permissions
            ? {
                admin: r.permissions.admin ?? false,
                push: r.permissions.push ?? false,
                pull: r.permissions.pull ?? false,
              }
            : undefined,
        }))
    );

    if (data.length < 100) break;
    page++;
  }

  return repos;
}

/**
 * Registers a GitHub webhook for pull_request events on the given repo.
 * Returns the webhook ID.
 */
export async function registerWebhook(params: {
  accessToken: string;
  owner: string;
  repo: string;
  webhookUrl: string;
  secret: string;
}): Promise<number> {
  const octokit = getOctokit(params.accessToken);

  const { data } = await octokit.repos.createWebhook({
    owner: params.owner,
    repo: params.repo,
    name: "web",
    active: true,
    events: ["pull_request"],
    config: {
      url: params.webhookUrl,
      content_type: "json",
      insecure_ssl: "0",
      secret: params.secret,
    },
  });

  return data.id;
}

/**
 * Deletes a GitHub webhook from a repository.
 */
export async function deleteWebhook(params: {
  accessToken: string;
  owner: string;
  repo: string;
  webhookId: number;
}): Promise<void> {
  const octokit = getOctokit(params.accessToken);

  await octokit.repos.deleteWebhook({
    owner: params.owner,
    repo: params.repo,
    hook_id: params.webhookId,
  });
}

/**
 * Fetches changed files for a pull request (paginated, up to 300 files).
 */
export async function getPRFiles(params: {
  accessToken: string;
  owner: string;
  repo: string;
  pullNumber: number;
}): Promise<PRFile[]> {
  const octokit = getOctokit(params.accessToken);
  const files: PRFile[] = [];
  let page = 1;

  while (files.length < 300) {
    const { data } = await octokit.pulls.listFiles({
      owner: params.owner,
      repo: params.repo,
      pull_number: params.pullNumber,
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    files.push(
      ...data.map((f) => ({
        filename: f.filename,
        status: f.status as PRFile["status"],
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
        patch: f.patch,
        blobUrl: f.blob_url,
      }))
    );

    if (data.length < 100) break;
    page++;
  }

  return files;
}

/**
 * Fetches detailed information about a pull request.
 */
export async function getPRDetails(params: {
  accessToken: string;
  owner: string;
  repo: string;
  pullNumber: number;
}): Promise<PRDetails> {
  const octokit = getOctokit(params.accessToken);

  const { data } = await octokit.pulls.get({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.pullNumber,
  });

  return {
    number: data.number,
    title: data.title,
    body: data.body ?? null,
    state: data.state as "open" | "closed",
    merged: data.merged ?? false,
    draft: data.draft ?? false,
    user: {
      login: data.user?.login ?? "unknown",
      avatarUrl: data.user?.avatar_url ?? "",
    },
    base: {
      ref: data.base.ref,
      sha: data.base.sha,
    },
    head: {
      ref: data.head.ref,
      sha: data.head.sha,
    },
    additions: data.additions,
    deletions: data.deletions,
    changedFiles: data.changed_files,
    htmlUrl: data.html_url,
  };
}

/**
 * Posts a review comment to a GitHub pull request.
 * Uses COMMENT event to be non-intrusive (no approve/reject).
 * Returns the GitHub review ID.
 */
export async function postPRReview(params: {
  accessToken: string;
  owner: string;
  repo: string;
  pullNumber: number;
  body: string;
}): Promise<number> {
  const octokit = getOctokit(params.accessToken);

  const { data } = await octokit.pulls.createReview({
    owner: params.owner,
    repo: params.repo,
    pull_number: params.pullNumber,
    body: params.body,
    event: "COMMENT",
  });

  return data.id;
}

/**
 * Fetches a single repository's details from GitHub.
 */
export async function getRepo(params: {
  accessToken: string;
  owner: string;
  repo: string;
}): Promise<GitHubRepo> {
  const octokit = getOctokit(params.accessToken);

  const { data } = await octokit.repos.get({
    owner: params.owner,
    repo: params.repo,
  });

  return {
    id: data.id,
    fullName: data.full_name,
    name: data.name,
    owner: data.owner.login,
    description: data.description ?? null,
    isPrivate: data.private,
    defaultBranch: data.default_branch,
    htmlUrl: data.html_url,
    language: data.language ?? null,
    stargazersCount: data.stargazers_count ?? 0,
    forksCount: data.forks_count ?? 0,
    permissions: data.permissions
      ? {
          admin: data.permissions.admin ?? false,
          push: data.permissions.push ?? false,
          pull: data.permissions.pull ?? false,
        }
      : undefined,
  };
}

/**
 * Lists the most recent open pull requests for a repository.
 */
export async function listOpenPRs(params: {
  accessToken: string;
  owner: string;
  repo: string;
  perPage?: number;
}): Promise<
  {
    number: number;
    title: string;
    user: { login: string; avatarUrl: string };
    base: string;
    head: string;
    draft: boolean;
    htmlUrl: string;
    createdAt: string;
    updatedAt: string;
  }[]
> {
  const octokit = getOctokit(params.accessToken);

  const { data } = await octokit.pulls.list({
    owner: params.owner,
    repo: params.repo,
    state: "open",
    per_page: params.perPage ?? 20,
    sort: "updated",
    direction: "desc",
  });

  return data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    user: {
      login: pr.user?.login ?? "unknown",
      avatarUrl: pr.user?.avatar_url ?? "",
    },
    base: pr.base.ref,
    head: pr.head.ref,
    draft: pr.draft ?? false,
    htmlUrl: pr.html_url,
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
  }));
}

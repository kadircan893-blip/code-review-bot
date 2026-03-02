import { PrismaClient } from "@prisma/client";

// String literal types since SQLite doesn't support enums
type ReviewStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
type CommentCategory = "BUG" | "SECURITY" | "PERFORMANCE" | "STYLE" | "MAINTAINABILITY" | "DOCUMENTATION" | "TEST_COVERAGE" | "GENERAL";
type CommentSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      login: "demo-user",
      githubId: "12345678",
      avatarUrl: "https://avatars.githubusercontent.com/u/12345678?v=4",
      accessToken: "demo-access-token",
      settings: {
        create: {
          reviewOnDraft: false,
          autoPostComments: true,
          minChangedFiles: 1,
          maxDiffLines: 2000,
          focusAreas: "bugs,security,performance,style",
          severityThreshold: "LOW",
          customInstructions:
            "Focus on TypeScript best practices and modern patterns.",
        },
      },
    },
  });

  // Create repositories
  const repo1 = await prisma.repository.upsert({
    where: { githubRepoId: 1001 },
    update: {},
    create: {
      userId: user.id,
      githubRepoId: 1001,
      fullName: "demo-user/nextjs-saas",
      name: "nextjs-saas",
      owner: "demo-user",
      description: "A modern SaaS template built with Next.js 14",
      isPrivate: false,
      defaultBranch: "main",
      webhookId: 200001,
      webhookSecret: "whsec_demo1_secret_key_xyz",
      isActive: true,
      lastActivityAt: new Date(),
    },
  });

  const repo2 = await prisma.repository.upsert({
    where: { githubRepoId: 1002 },
    update: {},
    create: {
      userId: user.id,
      githubRepoId: 1002,
      fullName: "demo-user/api-service",
      name: "api-service",
      owner: "demo-user",
      description: "RESTful API service with Node.js and Express",
      isPrivate: true,
      defaultBranch: "main",
      webhookId: 200002,
      webhookSecret: "whsec_demo2_secret_key_abc",
      isActive: true,
      lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // Create pull requests
  const prs = await Promise.all([
    prisma.pullRequest.upsert({
      where: { repositoryId_githubPrId: { repositoryId: repo1.id, githubPrId: 42 } },
      update: {},
      create: {
        repositoryId: repo1.id,
        githubPrId: 42,
        title: "feat: Add user authentication with NextAuth",
        body: "This PR adds GitHub OAuth authentication using NextAuth.js v5.",
        authorLogin: "demo-user",
        authorAvatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
        baseBranch: "main",
        headBranch: "feat/auth",
        isDraft: false,
        state: "open",
        htmlUrl: "https://github.com/demo-user/nextjs-saas/pull/42",
        additions: 320,
        deletions: 45,
        changedFiles: 12,
      },
    }),
    prisma.pullRequest.upsert({
      where: { repositoryId_githubPrId: { repositoryId: repo1.id, githubPrId: 41 } },
      update: {},
      create: {
        repositoryId: repo1.id,
        githubPrId: 41,
        title: "fix: Resolve race condition in database queries",
        body: "Fixes a race condition that caused duplicate records under high load.",
        authorLogin: "contributor1",
        authorAvatar: "https://avatars.githubusercontent.com/u/87654321?v=4",
        baseBranch: "main",
        headBranch: "fix/race-condition",
        isDraft: false,
        state: "merged",
        htmlUrl: "https://github.com/demo-user/nextjs-saas/pull/41",
        additions: 87,
        deletions: 23,
        changedFiles: 5,
        mergedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.pullRequest.upsert({
      where: { repositoryId_githubPrId: { repositoryId: repo2.id, githubPrId: 15 } },
      update: {},
      create: {
        repositoryId: repo2.id,
        githubPrId: 15,
        title: "refactor: Migrate to TypeScript strict mode",
        body: "Enables TypeScript strict mode and fixes all type errors.",
        authorLogin: "demo-user",
        authorAvatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
        baseBranch: "main",
        headBranch: "refactor/strict-ts",
        isDraft: false,
        state: "open",
        htmlUrl: "https://github.com/demo-user/api-service/pull/15",
        additions: 450,
        deletions: 210,
        changedFiles: 28,
      },
    }),
    prisma.pullRequest.upsert({
      where: { repositoryId_githubPrId: { repositoryId: repo2.id, githubPrId: 14 } },
      update: {},
      create: {
        repositoryId: repo2.id,
        githubPrId: 14,
        title: "chore: Update dependencies to latest versions",
        body: "Updates all npm packages to their latest versions.",
        authorLogin: "dependabot",
        authorAvatar: "https://avatars.githubusercontent.com/u/27347476?v=4",
        baseBranch: "main",
        headBranch: "chore/update-deps",
        isDraft: false,
        state: "closed",
        htmlUrl: "https://github.com/demo-user/api-service/pull/14",
        additions: 12,
        deletions: 12,
        changedFiles: 2,
      },
    }),
    prisma.pullRequest.upsert({
      where: { repositoryId_githubPrId: { repositoryId: repo1.id, githubPrId: 40 } },
      update: {},
      create: {
        repositoryId: repo1.id,
        githubPrId: 40,
        title: "feat: Add dashboard analytics with Recharts",
        body: "Adds interactive charts to the admin dashboard.",
        authorLogin: "demo-user",
        authorAvatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
        baseBranch: "main",
        headBranch: "feat/dashboard",
        isDraft: true,
        state: "open",
        htmlUrl: "https://github.com/demo-user/nextjs-saas/pull/40",
        additions: 185,
        deletions: 0,
        changedFiles: 8,
      },
    }),
  ]);

  // Create reviews for PRs
  const review1 = await prisma.review.create({
    data: {
      pullRequestId: prs[0].id,
      status: "COMPLETED",
      model: "claude-sonnet-4-6",
      promptTokens: 3245,
      completionTokens: 892,
      score: 78.5,
      grade: "B+",
      summary:
        "This PR implements GitHub OAuth authentication using NextAuth.js v5 with good overall structure. The implementation follows modern patterns but has a few security concerns around token storage and some performance opportunities.",
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 60 * 1000),
      githubCommentId: 1234567890,
    },
  });

  await prisma.reviewComment.createMany({
    data: [
      {
        reviewId: review1.id,
        path: "src/lib/auth.ts",
        line: 24,
        side: "RIGHT",
        category: "SECURITY",
        severity: "HIGH",
        title: "Access token stored in plain text",
        body: "Storing OAuth access tokens in plain text in the database is a security risk. Consider encrypting tokens at rest using AES-256 or a secrets management service.",
        suggestion: "import { encrypt } from '@/lib/crypto';\n\n// In the jwt callback:\ntoken.accessToken = await encrypt(account.access_token);",
      },
      {
        reviewId: review1.id,
        path: "src/middleware.ts",
        line: 15,
        side: "RIGHT",
        category: "PERFORMANCE",
        severity: "MEDIUM",
        title: "Middleware matcher is too broad",
        body: "The current middleware matcher runs on all routes including static assets. This adds unnecessary overhead. Exclude static files and API routes from the auth check.",
        suggestion: 'export const config = {\n  matcher: [\n    "/((?!api|_next/static|_next/image|favicon.ico).*)",\n  ],\n};',
      },
      {
        reviewId: review1.id,
        path: "src/app/(auth)/login/page.tsx",
        line: 45,
        side: "RIGHT",
        category: "BUG",
        severity: "LOW",
        title: "Missing error boundary for sign-in failures",
        body: "If signIn() fails (e.g., GitHub is down), the error is silently caught. Add proper error handling to display a user-friendly error message.",
      },
      {
        reviewId: review1.id,
        path: "src/lib/auth.ts",
        line: null,
        side: null,
        category: "DOCUMENTATION",
        severity: "INFO",
        title: "Missing JSDoc for auth callbacks",
        body: "The jwt and session callbacks are non-trivial. Adding JSDoc comments explaining why the accessToken is being exposed in the session would help future developers.",
      },
    ],
  });

  const review2 = await prisma.review.create({
    data: {
      pullRequestId: prs[1].id,
      status: "COMPLETED",
      model: "claude-sonnet-4-6",
      promptTokens: 1876,
      completionTokens: 543,
      score: 91.0,
      grade: "A",
      summary:
        "Excellent fix! The race condition is properly resolved using a database transaction with appropriate isolation level. The code is clean, well-tested, and follows existing patterns.",
      startedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000 + 3 * 60 * 1000),
      githubCommentId: 1234567891,
    },
  });

  await prisma.reviewComment.createMany({
    data: [
      {
        reviewId: review2.id,
        path: "src/db/queries.ts",
        line: 67,
        side: "RIGHT",
        category: "PERFORMANCE",
        severity: "LOW",
        title: "Consider using SELECT FOR UPDATE SKIP LOCKED",
        body: "For job queue patterns, SKIP LOCKED is more efficient than FOR UPDATE as it allows other workers to process different items instead of blocking.",
      },
    ],
  });

  const review3 = await prisma.review.create({
    data: {
      pullRequestId: prs[2].id,
      status: "RUNNING",
      model: "claude-sonnet-4-6",
      startedAt: new Date(Date.now() - 30 * 1000),
    },
  });

  const review4 = await prisma.review.create({
    data: {
      pullRequestId: prs[3].id,
      status: "SKIPPED",
      model: "claude-sonnet-4-6",
    },
  });

  const review5 = await prisma.review.create({
    data: {
      pullRequestId: prs[4].id,
      status: "PENDING",
      model: "claude-sonnet-4-6",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Users: 1`);
  console.log(`   Repositories: 2`);
  console.log(`   Pull Requests: ${prs.length}`);
  console.log(`   Reviews: 5`);
  console.log(`   Review Comments: 5`);

  // Suppress unused variable warnings
  void review3;
  void review4;
  void review5;
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

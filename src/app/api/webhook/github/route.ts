import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature, parseWebhookPayload } from "@/lib/webhook";
import { triggerReview } from "@/lib/review-engine";
import type { GitHubPRWebhookPayload } from "@/types/github";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const event = req.headers.get("x-github-event") ?? "";
  const signature = req.headers.get("x-hub-signature-256");

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event === "ping") {
    return NextResponse.json({ ok: true, message: "pong" });
  }

  if (event !== "pull_request") {
    return NextResponse.json({ ok: true, message: "Event ignored" });
  }

  const payload = body as GitHubPRWebhookPayload;
  const githubRepoId = payload.repository?.id;

  if (!githubRepoId) {
    return NextResponse.json({ error: "Missing repository id" }, { status: 400 });
  }

  // Find repository by GitHub repo ID
  const repository = await db.repository.findUnique({
    where: { githubRepoId },
    include: { user: true },
  });

  if (!repository || !repository.isActive) {
    return NextResponse.json({ ok: true, message: "Repository not tracked" });
  }

  // Verify HMAC signature
  const isValid = verifyWebhookSignature(
    repository.webhookSecret,
    rawBody,
    signature
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse and validate payload
  const parsed = parseWebhookPayload(event, body);
  if (!parsed || parsed.event !== "pull_request") {
    return NextResponse.json({ ok: true, message: "Action ignored" });
  }

  const pr = parsed.data.pull_request;

  // Upsert PullRequest record
  const pullRequest = await db.pullRequest.upsert({
    where: {
      repositoryId_githubPrId: {
        repositoryId: repository.id,
        githubPrId: pr.number,
      },
    },
    update: {
      title: pr.title,
      body: pr.body,
      state: pr.state,
      isDraft: pr.draft,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      updatedAt: new Date(),
    },
    create: {
      repositoryId: repository.id,
      githubPrId: pr.number,
      title: pr.title,
      body: pr.body,
      authorLogin: pr.user.login,
      authorAvatar: pr.user.avatar_url,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      isDraft: pr.draft,
      state: pr.state,
      htmlUrl: pr.html_url,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
    },
  });

  // Check user settings for draft reviews
  const settings = await db.userSettings.findUnique({
    where: { userId: repository.userId },
  });

  if (pr.draft && settings && !settings.reviewOnDraft) {
    const skippedReview = await db.review.create({
      data: {
        pullRequestId: pullRequest.id,
        status: "SKIPPED",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Draft PR skipped",
      reviewId: skippedReview.id,
    });
  }

  // Create pending review
  const review = await db.review.create({
    data: {
      pullRequestId: pullRequest.id,
      status: "PENDING",
    },
  });

  // Update repository activity
  await db.repository.update({
    where: { id: repository.id },
    data: { lastActivityAt: new Date() },
  });

  // Trigger review asynchronously (non-blocking)
  setImmediate(() => {
    triggerReview(review.id).catch((err) =>
      console.error(`[webhook] triggerReview failed for ${review.id}:`, err)
    );
  });

  return NextResponse.json({
    ok: true,
    message: "Review queued",
    reviewId: review.id,
  });
}

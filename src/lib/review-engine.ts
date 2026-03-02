import { db } from "@/lib/db";
import { getPRFiles } from "@/lib/github";
import { runCodeReview } from "@/lib/claude";
import { computeGrade, formatReviewForGitHub } from "@/lib/scoring";
import { postPRReview } from "@/lib/github";

/**
 * Main orchestration function for AI code reviews.
 * Never throws — all errors are persisted to the database.
 */
export async function triggerReview(reviewId: string): Promise<void> {
  let review;

  try {
    // Fetch review with all required relations
    review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        pullRequest: {
          include: {
            repository: {
              include: {
                user: {
                  select: { id: true, accessToken: true },
                },
              },
            },
          },
        },
      },
    });

    if (!review) {
      console.error(`[review-engine] Review ${reviewId} not found`);
      return;
    }

    const { pullRequest } = review;
    const { repository } = pullRequest;
    const { user } = repository;

    if (!user.accessToken) {
      await markFailed(reviewId, "No GitHub access token found for user");
      return;
    }

    // Fetch user settings
    const settings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    const effectiveSettings = settings ?? {
      reviewOnDraft: false,
      autoPostComments: true,
      minChangedFiles: 1,
      maxDiffLines: 2000,
      focusAreas: "bugs,security,performance,style",
      severityThreshold: "LOW",
      customInstructions: null,
    };

    // Mark review as RUNNING
    await db.review.update({
      where: { id: reviewId },
      data: { status: "RUNNING", startedAt: new Date() },
    });

    console.log(`[review-engine] Starting review ${reviewId} for PR #${pullRequest.githubPrId}`);

    // Fetch PR files from GitHub
    const files = await getPRFiles({
      accessToken: user.accessToken,
      owner: repository.owner,
      repo: repository.name,
      pullNumber: pullRequest.githubPrId,
    });

    // Check minimum changed files threshold
    if (files.length < effectiveSettings.minChangedFiles) {
      await db.review.update({
        where: { id: reviewId },
        data: {
          status: "SKIPPED",
          completedAt: new Date(),
          errorMessage: `PR has ${files.length} changed files, minimum is ${effectiveSettings.minChangedFiles}`,
        },
      });
      console.log(`[review-engine] Skipped review ${reviewId}: too few files (${files.length})`);
      return;
    }

    // Run AI code review
    const reviewResult = await runCodeReview({
      pr: pullRequest,
      files,
      settings: effectiveSettings as import("@prisma/client").UserSettings,
    });

    const grade = computeGrade(reviewResult.score);

    // Save review comments in a transaction
    await db.$transaction(async (tx) => {
      // Update review record
      await tx.review.update({
        where: { id: reviewId },
        data: {
          status: "COMPLETED",
          score: reviewResult.score,
          grade,
          summary: reviewResult.summary,
          promptTokens: reviewResult.promptTokens,
          completionTokens: reviewResult.completionTokens,
          rawResponse: JSON.stringify({
            summary: reviewResult.summary,
            score: reviewResult.score,
            highlights: reviewResult.highlights,
          }),
          completedAt: new Date(),
        },
      });

      // Create review comments
      if (reviewResult.comments.length > 0) {
        await tx.reviewComment.createMany({
          data: reviewResult.comments.map((c) => ({
            reviewId,
            path: c.path,
            line: c.line,
            side: c.side,
            category: c.category as string,
            severity: c.severity as string,
            title: c.title,
            body: c.body,
            suggestion: c.suggestion,
          })),
        });
      }
    });

    console.log(
      `[review-engine] Review ${reviewId} completed: score=${reviewResult.score}, grade=${grade}, comments=${reviewResult.comments.length}`
    );

    // Post GitHub review comment if enabled
    if (effectiveSettings.autoPostComments && user.accessToken) {
      try {
        const completedReview = await db.review.findUnique({
          where: { id: reviewId },
          include: { comments: true },
        });

        if (completedReview) {
          const markdown = formatReviewForGitHub(completedReview, pullRequest);
          const githubCommentId = await postPRReview({
            accessToken: user.accessToken,
            owner: repository.owner,
            repo: repository.name,
            pullNumber: pullRequest.githubPrId,
            body: markdown,
          });

          await db.review.update({
            where: { id: reviewId },
            data: { githubCommentId: String(githubCommentId) },
          });

          console.log(`[review-engine] Posted GitHub review comment: ${githubCommentId}`);
        }
      } catch (postErr) {
        console.error(
          `[review-engine] Failed to post GitHub comment for review ${reviewId}:`,
          postErr
        );
        // Don't fail the whole review if posting fails
      }
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error during review";
    console.error(`[review-engine] Review ${reviewId} failed:`, err);
    await markFailed(reviewId, message);
  }
}

async function markFailed(reviewId: string, errorMessage: string): Promise<void> {
  try {
    await db.review.update({
      where: { id: reviewId },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });
  } catch (e) {
    console.error(`[review-engine] Failed to mark review ${reviewId} as failed:`, e);
  }
}

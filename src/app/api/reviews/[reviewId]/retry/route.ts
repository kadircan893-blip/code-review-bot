import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { triggerReview } from "@/lib/review-engine";

interface Params {
  params: { reviewId: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const review = await db.review.findUnique({
    where: { id: params.reviewId },
    include: {
      pullRequest: {
        include: { repository: true },
      },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  if (review.pullRequest.repository.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (review.status !== "FAILED") {
    return NextResponse.json(
      { error: "Only failed reviews can be retried" },
      { status: 422 }
    );
  }

  // Reset review to PENDING
  await db.review.update({
    where: { id: review.id },
    data: {
      status: "PENDING",
      errorMessage: null,
      startedAt: null,
      completedAt: null,
      score: null,
      grade: null,
      summary: null,
      promptTokens: null,
      completionTokens: null,
    },
  });

  // Delete previous comments
  await db.reviewComment.deleteMany({ where: { reviewId: review.id } });

  // Trigger new review
  setImmediate(() => {
    triggerReview(review.id).catch((err) =>
      console.error(`[retry] triggerReview failed for ${review.id}:`, err)
    );
  });

  return NextResponse.json({ data: { reviewId: review.id, status: "PENDING" } });
}

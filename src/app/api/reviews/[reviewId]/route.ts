import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: { reviewId: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const review = await db.review.findUnique({
    where: { id: params.reviewId },
    include: {
      comments: {
        orderBy: [{ severity: "asc" }, { createdAt: "asc" }],
      },
      pullRequest: {
        include: {
          repository: true,
        },
      },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  // Ensure the review belongs to the current user
  if (review.pullRequest.repository.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: review });
}

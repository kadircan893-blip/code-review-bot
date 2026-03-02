import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: { reviewId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { reviewId } = params;

  // Verify ownership
  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { pullRequest: { include: { repository: true } } },
  });

  if (!review || review.pullRequest.repository.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Send initial status
      send({ type: "status", status: review.status });

      // If already terminal, close immediately
      if (review.status === "COMPLETED" || review.status === "FAILED" || review.status === "SKIPPED") {
        controller.close();
        return;
      }

      // Poll every 2 seconds
      let attempts = 0;
      const maxAttempts = 120; // 4 minutes max

      const interval = setInterval(async () => {
        attempts++;

        try {
          const current = await db.review.findUnique({
            where: { id: reviewId },
            select: { status: true, score: true, grade: true },
          });

          if (!current) {
            clearInterval(interval);
            controller.close();
            return;
          }

          send({ type: "status", status: current.status, score: current.score, grade: current.grade });

          if (
            current.status === "COMPLETED" ||
            current.status === "FAILED" ||
            current.status === "SKIPPED" ||
            attempts >= maxAttempts
          ) {
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);

      // Clean up on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

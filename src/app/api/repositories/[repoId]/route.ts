import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteWebhook } from "@/lib/github";

interface Params {
  params: { repoId: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repository = await db.repository.findFirst({
    where: { id: params.repoId, userId: session.user.id, isActive: true },
    include: {
      _count: { select: { pullRequests: true } },
      pullRequests: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          reviews: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              score: true,
              grade: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  return NextResponse.json({ data: repository });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repository = await db.repository.findFirst({
    where: { id: params.repoId, userId: session.user.id },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  // Delete webhook from GitHub
  if (repository.webhookId && session.accessToken) {
    try {
      await deleteWebhook({
        accessToken: session.accessToken,
        owner: repository.owner,
        repo: repository.name,
        webhookId: repository.webhookId,
      });
    } catch {
      // Log but don't fail — the repo might have been deleted or webhook manually removed
      console.warn(`Failed to delete webhook for repo ${repository.fullName}`);
    }
  }

  await db.repository.update({
    where: { id: repository.id },
    data: { isActive: false, webhookId: null },
  });

  return NextResponse.json({ data: { success: true } });
}

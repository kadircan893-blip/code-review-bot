import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRepo, registerWebhook } from "@/lib/github";
import { ConnectRepoSchema } from "@/types/api";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repositories = await db.repository.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      _count: {
        select: { pullRequests: true },
      },
      pullRequests: {
        take: 1,
        orderBy: { updatedAt: "desc" },
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
    orderBy: { lastActivityAt: "desc" },
  });

  return NextResponse.json({ data: repositories });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.accessToken) {
    return NextResponse.json(
      { error: "GitHub access token missing. Please sign in again." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = ConnectRepoSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const [owner, repoName] = result.data.githubRepoFullName.split("/");

  // Verify repo access on GitHub
  let ghRepo;
  try {
    ghRepo = await getRepo({
      accessToken: session.accessToken,
      owner,
      repo: repoName,
    });
  } catch {
    return NextResponse.json(
      { error: "Repository not found or access denied on GitHub" },
      { status: 404 }
    );
  }

  if (!ghRepo.permissions?.admin) {
    return NextResponse.json(
      { error: "You need admin access to connect this repository" },
      { status: 403 }
    );
  }

  // Check if already connected
  const existing = await db.repository.findUnique({
    where: { githubRepoId: ghRepo.id },
  });

  if (existing && existing.isActive) {
    return NextResponse.json(
      { error: "Repository is already connected" },
      { status: 409 }
    );
  }

  // Generate webhook secret
  const webhookSecret = randomBytes(32).toString("hex");
  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook/github`;

  // Register GitHub webhook
  let webhookId: number;
  try {
    webhookId = await registerWebhook({
      accessToken: session.accessToken,
      owner,
      repo: repoName,
      webhookUrl,
      secret: webhookSecret,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Failed to register GitHub webhook. Ensure you have admin access to the repository.",
      },
      { status: 422 }
    );
  }

  // Save repository to DB (upsert in case it was previously disconnected)
  const repository = await db.repository.upsert({
    where: { githubRepoId: ghRepo.id },
    update: {
      userId: session.user.id,
      webhookId,
      webhookSecret,
      isActive: true,
      connectedAt: new Date(),
      lastActivityAt: new Date(),
    },
    create: {
      userId: session.user.id,
      githubRepoId: ghRepo.id,
      fullName: ghRepo.fullName,
      name: ghRepo.name,
      owner: ghRepo.owner,
      description: ghRepo.description,
      isPrivate: ghRepo.isPrivate,
      defaultBranch: ghRepo.defaultBranch,
      webhookId,
      webhookSecret,
      isActive: true,
    },
  });

  // Create default UserSettings if not exists
  await db.userSettings.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json({ data: repository }, { status: 201 });
}

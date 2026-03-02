import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listOpenPRs } from "@/lib/github";

interface Params {
  params: { repoId: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repository = await db.repository.findFirst({
    where: { id: params.repoId, userId: session.user.id, isActive: true },
  });

  if (!repository) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const openPRs = await listOpenPRs({
    accessToken: session.accessToken,
    owner: repository.owner,
    repo: repository.name,
    perPage: 20,
  });

  let synced = 0;
  for (const pr of openPRs) {
    await db.pullRequest.upsert({
      where: {
        repositoryId_githubPrId: {
          repositoryId: repository.id,
          githubPrId: pr.number,
        },
      },
      update: {
        title: pr.title,
        isDraft: pr.draft,
        state: "open",
        updatedAt: new Date(pr.updatedAt),
      },
      create: {
        repositoryId: repository.id,
        githubPrId: pr.number,
        title: pr.title,
        authorLogin: pr.user.login,
        authorAvatar: pr.user.avatarUrl,
        baseBranch: pr.base,
        headBranch: pr.head,
        isDraft: pr.draft,
        state: "open",
        htmlUrl: pr.htmlUrl,
        createdAt: new Date(pr.createdAt),
      },
    });
    synced++;
  }

  await db.repository.update({
    where: { id: repository.id },
    data: { lastActivityAt: new Date() },
  });

  return NextResponse.json({ data: { synced } });
}

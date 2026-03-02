import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReviewFilterSchema } from "@/types/api";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const filters = ReviewFilterSchema.parse(searchParams);
  const { page, limit, status, grade, repositoryId } = filters;

  // Build where clause
  const where = {
    pullRequest: {
      repository: {
        userId: session.user.id,
        isActive: true,
        ...(repositoryId ? { id: repositoryId } : {}),
      },
    },
    ...(status ? { status } : {}),
    ...(grade ? { grade } : {}),
  };

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      include: {
        pullRequest: {
          include: {
            repository: {
              select: { id: true, name: true, fullName: true, owner: true },
            },
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.review.count({ where }),
  ]);

  return NextResponse.json({
    data: {
      items: reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  });
}

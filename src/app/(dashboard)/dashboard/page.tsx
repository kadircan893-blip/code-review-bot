import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentReviews } from "@/components/dashboard/RecentReviews";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [repos, recentReviews] = await Promise.all([
    db.repository.findMany({
      where: { userId: session.user.id, isActive: true },
      select: { id: true },
    }),
    db.review.findMany({
      where: {
        pullRequest: {
          repository: { userId: session.user.id },
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        pullRequest: {
          include: {
            repository: { select: { fullName: true } },
          },
        },
      },
    }),
  ]);

  // Compute stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalReviews, weeklyPRs, avgScoreResult] = await Promise.all([
    db.review.count({
      where: { pullRequest: { repository: { userId: session.user.id } } },
    }),
    db.pullRequest.count({
      where: {
        repository: { userId: session.user.id },
        createdAt: { gte: weekAgo },
      },
    }),
    db.review.aggregate({
      where: {
        pullRequest: { repository: { userId: session.user.id } },
        status: "COMPLETED",
        score: { not: null },
      },
      _avg: { score: true },
    }),
  ]);

  const stats = {
    totalReviews,
    weeklyPRs,
    averageScore: avgScoreResult._avg.score,
    connectedRepos: repos.length,
  };

  const isEmpty = repos.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"} 👋
          </h2>
          <p className="text-zinc-400 mt-1">
            Here&apos;s an overview of your code review activity.
          </p>
        </div>
        <Link
          href="/repositories"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Connect Repo
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-16 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-white text-xl font-semibold mb-2">
            No repositories connected yet
          </h3>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Connect your first GitHub repository to start getting AI-powered
            code reviews on every pull request.
          </p>
          <Link
            href="/repositories"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            Connect Your First Repo
          </Link>
        </div>
      ) : (
        <>
          <StatsCards stats={stats} />

          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityChart />
            <RecentReviews reviews={recentReviews as Parameters<typeof RecentReviews>[0]["reviews"]} />
          </div>
        </>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { CATEGORY_COLORS, type Category } from "@/types";
import { cn } from "@/lib/utils";

async function getStats() {
  const [totalBingos, totalGoalsCompleted, totalCards, goalsByCategory] =
    await Promise.all([
      prisma.bingo.count(),
      prisma.goal.count({
        where: { isCompleted: true, isFreeSpace: false, isPlaceholder: false },
      }),
      prisma.card.count(),
      prisma.goal.groupBy({
        by: ["category"],
        where: { isCompleted: true, isFreeSpace: false, isPlaceholder: false },
        _count: { id: true },
      }),
    ]);

  const bingosByType = await prisma.bingo.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  const topCards = await prisma.card.findMany({
    include: {
      _count: { select: { bingos: true } },
    },
    orderBy: {
      bingos: { _count: "desc" },
    },
    take: 5,
  });

  const recentCompletions = await prisma.goal.findMany({
    where: { isCompleted: true, isFreeSpace: false, isPlaceholder: false },
    orderBy: { completedAt: "desc" },
    take: 10,
    include: { card: { select: { name: true } } },
  });

  return {
    totalBingos,
    totalGoalsCompleted,
    totalCards,
    goalsByCategory: goalsByCategory.reduce(
      (acc, item) => {
        acc[item.category as Category] = item._count.id;
        return acc;
      },
      {} as Record<Category, number>
    ),
    bingosByType: bingosByType.reduce(
      (acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    ),
    topCards: topCards.map((c) => ({
      id: c.id,
      name: c.name,
      quarter: c.quarter,
      year: c.year,
      bingoCount: c._count.bingos,
    })),
    recentCompletions,
  };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Your lifetime achievement stats</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalBingos}</p>
            <p className="text-sm text-muted-foreground">Total Bingos</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalGoalsCompleted}</p>
            <p className="text-sm text-muted-foreground">Goals Completed</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.totalCards}</p>
            <p className="text-sm text-muted-foreground">Cards Created</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-3xl font-bold">
              {stats.totalCards > 0
                ? (stats.totalBingos / stats.totalCards).toFixed(1)
                : "0"}
            </p>
            <p className="text-sm text-muted-foreground">Avg Bingos/Card</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals by Category */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Goals by Category</h2>
          <div className="space-y-3">
            {(["CAREER", "HEALTH", "CREATIVE", "RELATIONSHIPS"] as const).map(
              (category) => {
                const count = stats.goalsByCategory[category] || 0;
                const maxCount = Math.max(
                  ...Object.values(stats.goalsByCategory),
                  1
                );
                const percentage = (count / maxCount) * 100;
                const colors = CATEGORY_COLORS[category];

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={colors.text}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", colors.bg)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Bingos by Type */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Bingos by Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {stats.bingosByType["HORIZONTAL"] || 0}
              </p>
              <p className="text-sm text-muted-foreground">Horizontal</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {stats.bingosByType["VERTICAL"] || 0}
              </p>
              <p className="text-sm text-muted-foreground">Vertical</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">
                {(stats.bingosByType["DIAGONAL_LEFT"] || 0) +
                  (stats.bingosByType["DIAGONAL_RIGHT"] || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Diagonal</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.totalBingos}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Top Cards</h2>
          {stats.topCards.length === 0 ? (
            <p className="text-muted-foreground text-sm">No cards yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topCards.map((card, index) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Q{card.quarter} {card.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">{card.bingoCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Completions */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Recent Completions</h2>
          {stats.recentCompletions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No completions yet
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentCompletions.slice(0, 5).map((goal) => {
                const category = goal.category as Category;
                const colors =
                  CATEGORY_COLORS[category] || CATEGORY_COLORS.CAREER;
                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        colors.bg.replace("100", "500")
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {goal.card.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

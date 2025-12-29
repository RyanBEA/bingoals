import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalBingos,
      totalGoalsCompleted,
      totalCards,
      goalsByCategory,
      bingosByType,
    ] = await Promise.all([
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
      prisma.bingo.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
    ]);

    // Get recent completions
    const recentCompletions = await prisma.goal.findMany({
      where: { isCompleted: true, isFreeSpace: false, isPlaceholder: false },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { card: { select: { name: true } } },
    });

    // Get cards with most bingos
    const cardsWithBingos = await prisma.card.findMany({
      include: {
        _count: { select: { bingos: true } },
      },
      orderBy: {
        bingos: { _count: "desc" },
      },
      take: 5,
    });

    return NextResponse.json({
      totalBingos,
      totalGoalsCompleted,
      totalCards,
      goalsByCategory: goalsByCategory.reduce(
        (acc, item) => {
          acc[item.category] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      bingosByType: bingosByType.reduce(
        (acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentCompletions,
      topCards: cardsWithBingos.map((c) => ({
        id: c.id,
        name: c.name,
        bingoCount: c._count.bingos,
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

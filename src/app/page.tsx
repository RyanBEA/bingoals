import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardPreview } from "@/components/cards/card-preview";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Target, Calendar } from "lucide-react";

async function getStats() {
  const [totalBingos, totalGoalsCompleted, totalCards] = await Promise.all([
    prisma.bingo.count(),
    prisma.goal.count({ where: { isCompleted: true, isFreeSpace: false } }),
    prisma.card.count(),
  ]);

  return { totalBingos, totalGoalsCompleted, totalCards };
}

async function getActiveCards() {
  const currentYear = new Date().getFullYear();
  return prisma.card.findMany({
    where: { year: currentYear },
    include: {
      goals: true,
      bingos: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const [stats, cards] = await Promise.all([getStats(), getActiveCards()]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">BINGOALS</h1>
          <p className="text-muted-foreground">
            Track your goals, bingo-style
          </p>
        </div>
        <Link href="/cards/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalBingos}</p>
            <p className="text-sm text-muted-foreground">Bingos</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalGoalsCompleted}</p>
            <p className="text-sm text-muted-foreground">Goals Completed</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalCards}</p>
            <p className="text-sm text-muted-foreground">Active Cards</p>
          </div>
        </div>
      </div>

      {/* Active Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Cards</h2>
        {cards.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No cards yet. Create your first bingo card to get started!
            </p>
            <Link href="/cards/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Card
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <CardPreview key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

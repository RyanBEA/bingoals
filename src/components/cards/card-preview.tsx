import Link from "next/link";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import type { Card, Goal, Bingo, Category } from "@/types";
import { CATEGORY_COLORS } from "@/types";
import { Progress } from "@/components/ui/progress";

interface CardPreviewProps {
  card: Card & { goals: Goal[]; bingos: Bingo[] };
}

export function CardPreview({ card }: CardPreviewProps) {
  const completedGoals = card.goals.filter(
    (g) => g.isCompleted && !g.isFreeSpace && !g.isPlaceholder
  ).length;
  const totalGoals = card.goals.filter(
    (g) => !g.isFreeSpace && !g.isPlaceholder
  ).length;
  const completionPercentage =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  // Sort goals by position for mini grid
  const sortedGoals = [...card.goals].sort((a, b) => a.position - b.position);

  return (
    <Link
      href={`/cards/${card.id}`}
      className="block bg-card border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">{card.name}</h3>
          <p className="text-sm text-muted-foreground">
            Q{card.quarter} {card.year}
          </p>
        </div>
        {card.bingos.length > 0 && (
          <div className="flex items-center gap-1 text-green-600">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">{card.bingos.length}</span>
          </div>
        )}
      </div>

      {/* Mini 5x5 Grid Preview */}
      <div className="grid grid-cols-5 gap-0.5 mb-3">
        {sortedGoals.map((goal) => {
          const category = goal.category as Category;
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.CAREER;
          return (
            <div
              key={goal.id}
              className={cn(
                "aspect-square rounded-sm",
                goal.isCompleted ? colors.bg : "bg-gray-100",
                goal.isFreeSpace && "bg-yellow-200",
                goal.isPlaceholder && "bg-gray-200 border border-dashed border-gray-300"
              )}
            />
          );
        })}
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {completedGoals}/{totalGoals}
          </span>
        </div>
        <Progress value={completionPercentage} />
      </div>
    </Link>
  );
}

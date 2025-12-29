"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BingoGrid } from "@/components/bingo/bingo-grid";
import { Celebration } from "@/components/bingo/celebration";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Trash2 } from "lucide-react";
import type { Card, Goal, Bingo } from "@/types";

interface CardViewProps {
  card: Card & { goals: Goal[]; bingos: Bingo[] };
}

export function CardView({ card: initialCard }: CardViewProps) {
  const router = useRouter();
  const [card, setCard] = useState(initialCard);
  const [showCelebration, setShowCelebration] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const completedGoals = card.goals.filter(
    (g) => g.isCompleted && !g.isFreeSpace && !g.isPlaceholder
  ).length;
  const totalGoals = card.goals.filter(
    (g) => !g.isFreeSpace && !g.isPlaceholder
  ).length;
  const completionPercentage =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const handleGoalToggle = useCallback(
    async (goalId: string, completed: boolean) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: completed }),
      });

      if (response.ok) {
        const { goal: updatedGoal, newBingo } = await response.json();

        setCard((prev) => ({
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, ...updatedGoal } : g
          ),
        }));

        if (newBingo) {
          setShowCelebration(true);
        }
        // Refresh to get updated bingos (both for new bingos and invalidated ones)
        router.refresh();
      }
    },
    [router]
  );

  const handleFreeSpaceUpdate = useCallback(
    async (goalId: string, title: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, isCompleted: true }),
      });

      if (response.ok) {
        const { goal: updatedGoal, newBingo } = await response.json();

        setCard((prev) => ({
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, ...updatedGoal } : g
          ),
        }));

        if (newBingo) {
          setShowCelebration(true);
          router.refresh();
        }
      }
    },
    [router]
  );

  const handleAddGoal = useCallback(
    async (title: string, category: string) => {
      const response = await fetch(`/api/cards/${card.id}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });

      if (response.ok) {
        router.refresh();
        // Refresh the page to get updated card data
        window.location.reload();
      }
    },
    [card.id, router]
  );

  const handleEditGoal = useCallback(
    async (goalId: string, title: string, category: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });

      if (response.ok) {
        const { goal: updatedGoal } = await response.json();
        setCard((prev) => ({
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, ...updatedGoal } : g
          ),
        }));
      }
    },
    []
  );

  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const { goal: updatedGoal } = await response.json();
        setCard((prev) => ({
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, ...updatedGoal } : g
          ),
        }));
        // Refresh to get updated bingos
        router.refresh();
      }
    },
    [router]
  );

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    setDeleting(true);
    const response = await fetch(`/api/cards/${card.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/cards");
    } else {
      setDeleting(false);
      alert("Failed to delete card");
    }
  }, [card.id, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{card.name}</h1>
            <p className="text-muted-foreground">
              Q{card.quarter} {card.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {card.bingos.length > 0 && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4" />
              <span className="font-medium">
                {card.bingos.length} Bingo{card.bingos.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Goals Completed</span>
          <span className="font-medium">
            {completedGoals} / {totalGoals}
          </span>
        </div>
        <Progress value={completionPercentage} />
      </div>

      {/* Bingo Grid */}
      <div className="bg-card border rounded-lg p-4 sm:p-6">
        <BingoGrid
          goals={card.goals}
          bingos={card.bingos}
          cardId={card.id}
          onGoalToggle={handleGoalToggle}
          onFreeSpaceUpdate={handleFreeSpaceUpdate}
          onAddGoal={handleAddGoal}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      </div>

      {/* Legend */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-3">Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-500" />
            <span>Career</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-500" />
            <span>Health</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-500" />
            <span>Creative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-500" />
            <span>Relationships</span>
          </div>
        </div>
      </div>

      <Celebration
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { BingoCell } from "./bingo-cell";
import { FreeSpaceDialog } from "./free-space-dialog";
import { AddGoalDialog } from "../cards/add-goal-dialog";
import { Celebration } from "./celebration";
import type { Goal, Bingo } from "@/types";
import { getPositionsInLine } from "@/lib/bingo-detection";

interface BingoGridProps {
  goals: Goal[];
  bingos: Bingo[];
  cardId: string;
  onGoalToggle?: (goalId: string, completed: boolean) => Promise<void>;
  onFreeSpaceUpdate?: (goalId: string, title: string) => Promise<void>;
  onAddGoal?: (title: string, category: string) => Promise<void>;
}

export function BingoGrid({
  goals,
  bingos,
  cardId,
  onGoalToggle,
  onFreeSpaceUpdate,
  onAddGoal,
}: BingoGridProps) {
  const [selectedFreeSpace, setSelectedFreeSpace] = useState<Goal | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<Goal | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [processingGoalId, setProcessingGoalId] = useState<string | null>(null);

  // Sort goals by position
  const sortedGoals = [...goals].sort((a, b) => a.position - b.position);

  // Get all positions that are part of a bingo line
  const bingoPositions = new Set<number>();
  bingos.forEach((bingo) => {
    const positions = getPositionsInLine(
      bingo.type as "HORIZONTAL" | "VERTICAL" | "DIAGONAL_LEFT" | "DIAGONAL_RIGHT",
      bingo.lineIndex
    );
    positions.forEach((pos) => bingoPositions.add(pos));
  });

  const handleCellClick = async (goal: Goal) => {
    if (processingGoalId) return;

    if (goal.isFreeSpace) {
      setSelectedFreeSpace(goal);
      return;
    }

    if (goal.isPlaceholder) {
      setSelectedPlaceholder(goal);
      return;
    }

    if (onGoalToggle) {
      setProcessingGoalId(goal.id);
      const previousBingoCount = bingos.length;
      await onGoalToggle(goal.id, !goal.isCompleted);
      setProcessingGoalId(null);

      // Check if a new bingo was achieved (this would require re-fetching data)
      // For now, celebration is triggered by the parent component
    }
  };

  const handleFreeSpaceSave = async (title: string) => {
    if (selectedFreeSpace && onFreeSpaceUpdate) {
      await onFreeSpaceUpdate(selectedFreeSpace.id, title);
      setSelectedFreeSpace(null);
    }
  };

  const handleAddGoal = async (title: string, category: string) => {
    if (onAddGoal) {
      await onAddGoal(title, category);
      setSelectedPlaceholder(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-lg mx-auto">
        {sortedGoals.map((goal) => (
          <BingoCell
            key={goal.id}
            goal={goal}
            isInBingoLine={bingoPositions.has(goal.position)}
            onClick={() => handleCellClick(goal)}
          />
        ))}
      </div>

      <FreeSpaceDialog
        open={!!selectedFreeSpace}
        onOpenChange={(open) => !open && setSelectedFreeSpace(null)}
        goal={selectedFreeSpace}
        onSave={handleFreeSpaceSave}
      />

      <AddGoalDialog
        open={!!selectedPlaceholder}
        onOpenChange={(open) => !open && setSelectedPlaceholder(null)}
        onSave={handleAddGoal}
      />

      <Celebration
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
}

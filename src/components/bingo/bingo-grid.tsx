"use client";

import { useState } from "react";
import { BingoCell } from "./bingo-cell";
import { FreeSpaceDialog } from "./free-space-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
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
  onEditGoal?: (goalId: string, title: string, category: string) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
}

export function BingoGrid({
  goals,
  bingos,
  onGoalToggle,
  onFreeSpaceUpdate,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}: BingoGridProps) {
  const [selectedFreeSpace, setSelectedFreeSpace] = useState<Goal | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<Goal | null>(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<Goal | null>(null);
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

    // If goal is completed, open edit dialog
    if (goal.isCompleted) {
      setSelectedGoalForEdit(goal);
      return;
    }

    // Otherwise toggle completion
    if (onGoalToggle) {
      setProcessingGoalId(goal.id);
      await onGoalToggle(goal.id, true);
      setProcessingGoalId(null);
    }
  };

  const handleCellLongPress = (goal: Goal) => {
    // Long press opens edit dialog for any non-placeholder, non-free-space goal
    if (!goal.isFreeSpace && !goal.isPlaceholder) {
      setSelectedGoalForEdit(goal);
    }
  };

  const handleEditGoal = async (goalId: string, title: string, category: string) => {
    if (onEditGoal) {
      await onEditGoal(goalId, title, category);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (onDeleteGoal) {
      await onDeleteGoal(goalId);
    }
  };

  const handleToggleComplete = async (goalId: string, completed: boolean) => {
    if (onGoalToggle) {
      await onGoalToggle(goalId, completed);
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
            onLongPress={() => handleCellLongPress(goal)}
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

      <EditGoalDialog
        open={!!selectedGoalForEdit}
        onOpenChange={(open) => !open && setSelectedGoalForEdit(null)}
        goal={selectedGoalForEdit}
        onSave={handleEditGoal}
        onDelete={handleDeleteGoal}
        onToggleComplete={handleToggleComplete}
      />

      <Celebration
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
}

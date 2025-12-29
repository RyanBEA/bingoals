"use client";

import { cn } from "@/lib/utils";
import { Check, Star, HelpCircle } from "lucide-react";
import type { Goal, Category } from "@/types";
import { CATEGORY_COLORS } from "@/types";

interface BingoCellProps {
  goal: Goal;
  isInBingoLine?: boolean;
  onClick?: () => void;
}

export function BingoCell({ goal, isInBingoLine, onClick }: BingoCellProps) {
  const category = goal.category as Category;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.CAREER;

  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square p-1 sm:p-2 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all",
        "hover:scale-105 active:scale-95",
        colors.border,
        goal.isCompleted ? colors.bg : "bg-white",
        goal.isFreeSpace && "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-500",
        goal.isPlaceholder && "bg-gray-100 border-gray-300 border-dashed",
        isInBingoLine && "bingo-line-glow"
      )}
    >
      {goal.isCompleted && !goal.isFreeSpace && (
        <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 mb-1" />
      )}
      {goal.isFreeSpace && goal.isCompleted && (
        <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600 mb-1" />
      )}
      {goal.isPlaceholder && (
        <HelpCircle className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-1" />
      )}
      <span
        className={cn(
          "text-[10px] sm:text-xs font-medium leading-tight line-clamp-3",
          goal.isCompleted && !goal.isFreeSpace && colors.text,
          goal.isFreeSpace && "text-yellow-700",
          goal.isPlaceholder && "text-gray-400 italic"
        )}
      >
        {goal.title}
      </span>
    </button>
  );
}

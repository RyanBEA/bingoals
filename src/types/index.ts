export type Category = "CAREER" | "HEALTH" | "CREATIVE" | "RELATIONSHIPS" | "FINANCIAL" | "HOME";

export type BingoType =
  | "HORIZONTAL"
  | "VERTICAL"
  | "DIAGONAL_LEFT"
  | "DIAGONAL_RIGHT";

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  position: number;
  isCompleted: boolean;
  completedAt: Date | null;
  isFreeSpace: boolean;
  isPlaceholder: boolean;
  metadata: string | null;
  cardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bingo {
  id: string;
  type: string;
  lineIndex: number;
  achievedAt: Date;
  cardId: string;
}

export interface Card {
  id: string;
  name: string;
  quarter: number;
  year: number;
  playerId: string;
  createdAt: Date;
  updatedAt: Date;
  goals: Goal[];
  bingos: Bingo[];
}

export interface Player {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  cards: Card[];
}

export const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string }> = {
  CAREER: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-700",
  },
  HEALTH: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-700",
  },
  CREATIVE: {
    bg: "bg-purple-100",
    border: "border-purple-500",
    text: "text-purple-700",
  },
  RELATIONSHIPS: {
    bg: "bg-orange-100",
    border: "border-orange-500",
    text: "text-orange-700",
  },
  FINANCIAL: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-700",
  },
  HOME: {
    bg: "bg-teal-100",
    border: "border-teal-500",
    text: "text-teal-700",
  },
};

import type { ParsedGoal, Category } from "./csv-parser";

export interface PositionedGoal {
  title: string;
  category: Category;
  description?: string;
  metadata?: Record<string, unknown>;
  position: number;
  isFreeSpace: boolean;
  isPlaceholder: boolean;
}

export function randomizeGrid(goals: ParsedGoal[]): PositionedGoal[] {
  // Fisher-Yates shuffle
  const shuffled = [...goals];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create array of available positions (0-24, excluding center 12)
  const availablePositions = Array.from({ length: 25 }, (_, i) => i).filter(
    (i) => i !== 12
  );

  // Shuffle positions too
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [
      availablePositions[j],
      availablePositions[i],
    ];
  }

  const positioned: PositionedGoal[] = [];

  // Assign goals to random positions
  shuffled.forEach((goal, index) => {
    positioned.push({
      ...goal,
      position: availablePositions[index],
      isFreeSpace: false,
      isPlaceholder: false,
    });
  });

  // Fill remaining positions with placeholders
  const usedPositions = new Set(positioned.map((g) => g.position));
  for (let pos = 0; pos < 25; pos++) {
    if (pos === 12) {
      // Center is FREE SPACE
      positioned.push({
        title: "FREE SPACE",
        category: "CREATIVE",
        position: 12,
        isFreeSpace: true,
        isPlaceholder: false,
      });
    } else if (!usedPositions.has(pos)) {
      // Empty slot becomes placeholder
      positioned.push({
        title: "TBD",
        category: "CAREER", // Default category for placeholders
        position: pos,
        isFreeSpace: false,
        isPlaceholder: true,
      });
    }
  }

  // Sort by position for consistent ordering
  return positioned.sort((a, b) => a.position - b.position);
}

export function getRandomPlaceholderPosition(
  goals: Array<{ position: number; isPlaceholder: boolean }>
): number | null {
  const placeholderPositions = goals
    .filter((g) => g.isPlaceholder)
    .map((g) => g.position);

  if (placeholderPositions.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * placeholderPositions.length);
  return placeholderPositions[randomIndex];
}

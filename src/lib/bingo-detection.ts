export type BingoType =
  | "HORIZONTAL"
  | "VERTICAL"
  | "DIAGONAL_LEFT"
  | "DIAGONAL_RIGHT";

export interface BingoResult {
  type: BingoType;
  lineIndex: number;
}

export interface GoalForDetection {
  position: number;
  isCompleted: boolean;
}

export function detectBingos(goals: GoalForDetection[]): BingoResult[] {
  // Create 5x5 grid from flat array
  const grid: boolean[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(false));

  goals.forEach((goal) => {
    const row = Math.floor(goal.position / 5);
    const col = goal.position % 5;
    grid[row][col] = goal.isCompleted;
  });

  const bingos: BingoResult[] = [];

  // Check rows (horizontal)
  for (let row = 0; row < 5; row++) {
    if (grid[row].every((cell) => cell)) {
      bingos.push({ type: "HORIZONTAL", lineIndex: row });
    }
  }

  // Check columns (vertical)
  for (let col = 0; col < 5; col++) {
    if (grid.every((row) => row[col])) {
      bingos.push({ type: "VERTICAL", lineIndex: col });
    }
  }

  // Check diagonal (top-left to bottom-right)
  if ([0, 1, 2, 3, 4].every((i) => grid[i][i])) {
    bingos.push({ type: "DIAGONAL_LEFT", lineIndex: 0 });
  }

  // Check diagonal (top-right to bottom-left)
  if ([0, 1, 2, 3, 4].every((i) => grid[i][4 - i])) {
    bingos.push({ type: "DIAGONAL_RIGHT", lineIndex: 1 });
  }

  return bingos;
}

export function getPositionsInLine(
  type: BingoType,
  lineIndex: number
): number[] {
  switch (type) {
    case "HORIZONTAL":
      return [0, 1, 2, 3, 4].map((col) => lineIndex * 5 + col);
    case "VERTICAL":
      return [0, 1, 2, 3, 4].map((row) => row * 5 + lineIndex);
    case "DIAGONAL_LEFT":
      return [0, 1, 2, 3, 4].map((i) => i * 5 + i);
    case "DIAGONAL_RIGHT":
      return [0, 1, 2, 3, 4].map((i) => i * 5 + (4 - i));
    default:
      return [];
  }
}

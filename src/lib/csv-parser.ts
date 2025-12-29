import Papa from "papaparse";

export type Category = "CAREER" | "HEALTH" | "CREATIVE" | "RELATIONSHIPS" | "FINANCIAL" | "HOME";

export interface ParsedGoal {
  title: string;
  category: Category;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ParseResult {
  success: boolean;
  goals?: ParsedGoal[];
  errors?: string[];
}

const VALID_CATEGORIES: Category[] = [
  "CAREER",
  "HEALTH",
  "CREATIVE",
  "RELATIONSHIPS",
  "FINANCIAL",
  "HOME",
];

export function parseGoalsCSV(csvContent: string): ParseResult {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (result.errors.length > 0) {
    return {
      success: false,
      errors: result.errors.map((e) => e.message),
    };
  }

  const goals: ParsedGoal[] = [];
  const errors: string[] = [];

  (result.data as Record<string, string>[]).forEach((row, index) => {
    const { title, category, description, ...extraFields } = row;

    if (!title?.trim()) {
      errors.push(`Row ${index + 1}: Missing title`);
      return;
    }

    const normalizedCategory = category?.toUpperCase().trim() as Category;
    if (!VALID_CATEGORIES.includes(normalizedCategory)) {
      errors.push(
        `Row ${index + 1}: Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`
      );
      return;
    }

    goals.push({
      title: title.trim(),
      category: normalizedCategory,
      description: description?.trim() || undefined,
      metadata:
        Object.keys(extraFields).length > 0 ? extraFields : undefined,
    });
  });

  if (goals.length > 24) {
    errors.push(`Too many goals: got ${goals.length}, maximum is 24`);
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, goals };
}

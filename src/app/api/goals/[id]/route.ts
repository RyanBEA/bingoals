import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectBingos } from "@/lib/bingo-detection";

// PATCH toggle goal completion
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isCompleted, title } = body as {
      isCompleted?: boolean;
      title?: string;
    };

    // Get current goal
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { card: { include: { goals: true, bingos: true } } },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Update goal
    const updateData: {
      isCompleted?: boolean;
      completedAt?: Date | null;
      title?: string;
    } = {};

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    if (title !== undefined) {
      updateData.title = title;
    }

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    // Check for new bingos
    let newBingo = false;
    if (isCompleted === true) {
      const updatedGoals = goal.card.goals.map((g) =>
        g.id === id ? { ...g, isCompleted: true } : g
      );

      const detectedBingos = detectBingos(updatedGoals);
      const existingBingoKeys = new Set(
        goal.card.bingos.map((b) => `${b.type}-${b.lineIndex}`)
      );

      // Find new bingos
      const newBingos = detectedBingos.filter(
        (b) => !existingBingoKeys.has(`${b.type}-${b.lineIndex}`)
      );

      // Create new bingos
      if (newBingos.length > 0) {
        await prisma.bingo.createMany({
          data: newBingos.map((b) => ({
            cardId: goal.cardId,
            type: b.type,
            lineIndex: b.lineIndex,
          })),
        });
        newBingo = true;
      }
    }

    return NextResponse.json({ goal: updatedGoal, newBingo });
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

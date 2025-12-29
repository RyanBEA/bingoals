import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRandomPlaceholderPosition } from "@/lib/randomize-grid";

// POST add goal to placeholder
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params;
    const body = await request.json();
    const { title, category } = body as { title: string; category: string };

    // Get card with goals
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { goals: true },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Find a random placeholder position
    const placeholderPosition = getRandomPlaceholderPosition(card.goals);

    if (placeholderPosition === null) {
      return NextResponse.json(
        { error: "No placeholder slots available" },
        { status: 400 }
      );
    }

    // Find the placeholder goal at this position
    const placeholderGoal = card.goals.find(
      (g) => g.position === placeholderPosition && g.isPlaceholder
    );

    if (!placeholderGoal) {
      return NextResponse.json(
        { error: "Placeholder not found" },
        { status: 400 }
      );
    }

    // Update the placeholder with the new goal
    const updatedGoal = await prisma.goal.update({
      where: { id: placeholderGoal.id },
      data: {
        title,
        category,
        isPlaceholder: false,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error adding goal:", error);
    return NextResponse.json({ error: "Failed to add goal" }, { status: 500 });
  }
}

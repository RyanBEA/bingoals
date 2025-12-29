import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomizeGrid, type PositionedGoal } from "@/lib/randomize-grid";
import type { ParsedGoal } from "@/lib/csv-parser";

// GET all cards
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      include: {
        goals: true,
        bingos: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// POST create new card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, quarter, year, goals } = body as {
      name: string;
      quarter: number;
      year: number;
      goals: ParsedGoal[];
    };

    // Get or create default player
    let player = await prisma.player.findFirst();
    if (!player) {
      player = await prisma.player.create({
        data: { name: "Player 1" },
      });
    }

    // Randomize goal positions
    const positionedGoals: PositionedGoal[] = randomizeGrid(goals);

    // Create card with goals
    const card = await prisma.card.create({
      data: {
        name,
        quarter,
        year,
        playerId: player.id,
        goals: {
          create: positionedGoals.map((goal) => ({
            title: goal.title,
            description: goal.description,
            category: goal.category,
            position: goal.position,
            isFreeSpace: goal.isFreeSpace,
            isPlaceholder: goal.isPlaceholder,
            metadata: goal.metadata ? JSON.stringify(goal.metadata) : null,
          })),
        },
      },
      include: {
        goals: true,
        bingos: true,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

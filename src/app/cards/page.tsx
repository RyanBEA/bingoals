import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardPreview } from "@/components/cards/card-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

async function getCards() {
  return prisma.card.findMany({
    include: {
      goals: true,
      bingos: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function CardsPage() {
  const cards = await getCards();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">All Cards</h1>
          <p className="text-muted-foreground">
            {cards.length} card{cards.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/cards/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No cards yet. Create your first bingo card to get started!
          </p>
          <Link href="/cards/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Card
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <CardPreview key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}

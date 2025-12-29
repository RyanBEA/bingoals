import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardView } from "./card-view";

async function getCard(id: string) {
  return prisma.card.findUnique({
    where: { id },
    include: {
      goals: {
        orderBy: { position: "asc" },
      },
      bingos: true,
    },
  });
}

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    notFound();
  }

  return <CardView card={card} />;
}

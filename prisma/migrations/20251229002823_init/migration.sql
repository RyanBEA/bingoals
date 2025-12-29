-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Player 1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "playerId" TEXT NOT NULL,
    CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "isFreeSpace" BOOLEAN NOT NULL DEFAULT false,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "cardId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bingo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "lineIndex" INTEGER NOT NULL,
    "achievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" TEXT NOT NULL,
    CONSTRAINT "Bingo_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Goal_cardId_position_key" ON "Goal"("cardId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Bingo_cardId_type_lineIndex_key" ON "Bingo"("cardId", "type", "lineIndex");

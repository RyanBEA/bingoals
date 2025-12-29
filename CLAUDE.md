# BINGOALS

A bingo-style goal tracker for quarterly goals. Create 5x5 bingo cards with your goals and track completion throughout the year.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite + Prisma ORM
- **Celebration**: canvas-confetti
- **CSV Parsing**: Papa Parse
- **Deployment**: Railway (with persistent volume for SQLite)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── cards/         # Card CRUD + goals endpoint
│   │   ├── goals/[id]/    # Goal completion/edit/delete
│   │   └── stats/         # Statistics aggregation
│   ├── cards/             # Card pages
│   │   ├── [id]/          # Individual card view
│   │   └── new/           # CSV upload + card creation
│   ├── stats/             # Statistics dashboard
│   └── page.tsx           # Home dashboard
├── components/
│   ├── bingo/             # Bingo grid components
│   │   ├── bingo-grid.tsx # 5x5 grid container
│   │   ├── bingo-cell.tsx # Individual cell
│   │   ├── celebration.tsx # Confetti animation
│   │   ├── edit-goal-dialog.tsx
│   │   └── free-space-dialog.tsx
│   ├── cards/             # Card-related components
│   │   ├── csv-uploader.tsx
│   │   ├── card-preview.tsx
│   │   └── add-goal-dialog.tsx
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── bingo-detection.ts # Bingo line detection algorithm
│   ├── csv-parser.ts      # CSV parsing with validation
│   ├── randomize-grid.ts  # Goal placement randomization
│   └── utils.ts           # Utility functions (cn)
└── types/
    └── index.ts           # TypeScript types + category colors
```

## Data Model

```
Player (1) ──< Card (many) ──< Goal (25 per card)
                          └──< Bingo (detected lines)
```

- **Player**: User entity (supports future multi-player)
- **Card**: Quarterly bingo card (Q1-Q4, year)
- **Goal**: Individual goal in a position (0-24), includes free space and placeholders
- **Bingo**: Achieved bingo lines (horizontal, vertical, diagonal)

## Key Concepts

### Goal Categories
- `CAREER` (blue)
- `HEALTH` (green)
- `CREATIVE` (purple)
- `RELATIONSHIPS` (orange)

### Grid Positions
- 5x5 grid, positions 0-24
- Position 12 (center) is always FREE SPACE
- Positions are randomized on card creation

### Bingo Detection
- Checks all 5 rows, 5 columns, 2 diagonals
- New bingos recorded with timestamp
- Bingos invalidated when goals are uncompleted or deleted

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create/apply migrations
npx prisma generate      # Regenerate client

# Railway
railway logs             # Stream deploy logs
railway logs --build     # Stream build logs
```

## Environment Variables

```env
DATABASE_URL=file:./dev.db           # Local development
DATABASE_URL=file:/app/data/bingoals.db  # Railway (persistent volume)
```

## Railway Deployment Notes

- Volume mounted at `/app/data` for SQLite persistence
- `prisma migrate deploy` runs at startup (not build time)
- All database-dependent pages use `export const dynamic = "force-dynamic"`
- Healthcheck path: `/` with 300s timeout

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cards` | List all cards |
| POST | `/api/cards` | Create card with goals |
| GET | `/api/cards/[id]` | Get card details |
| DELETE | `/api/cards/[id]` | Delete card |
| POST | `/api/cards/[id]/goals` | Add goal to placeholder |
| PATCH | `/api/goals/[id]` | Update goal (complete/edit) |
| DELETE | `/api/goals/[id]` | Delete goal (converts to placeholder) |
| GET | `/api/stats` | Get aggregated statistics |

## CSV Format

```csv
title,category,description
"Get promoted",CAREER,"Achieve senior level"
"Run a marathon",HEALTH,
"Write a book",CREATIVE,"Fiction novel"
```

- Maximum 24 goals (remaining become placeholders)
- Categories must match: CAREER, HEALTH, CREATIVE, RELATIONSHIPS
- Description is optional

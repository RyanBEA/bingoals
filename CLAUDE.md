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
design/
└── logo/                   # Logo source files
    ├── logo.svg            # Main logo (light backgrounds)
    ├── logo-dark.svg       # Dark background variant
    ├── logo-icon.svg       # Icon only (dabber with checkmark)
    ├── logo-concepts.html  # Interactive concept explorer
    └── logo-final.html     # Final version with tunable values

public/
├── logo-light.png          # Production logo (transparent)
├── logo-dark.png           # Dark variant
└── logo-icon.png           # Icon variant

src/
├── app/                    # Next.js App Router pages
│   ├── icon.png           # Favicon (auto-detected by Next.js)
│   ├── apple-icon.png     # Apple touch icon
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
- `CAREER` (blue) - Work, professional growth
- `HEALTH` (green) - Physical, mental, fitness
- `CREATIVE` (purple) - Learning, creativity, skills, hobbies
- `RELATIONSHIPS` (orange) - Family, friends, social
- `FINANCIAL` (yellow) - Money, savings, investments, major purchases
- `HOME` (teal) - House projects, maintenance, organization, errands

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
- **Do NOT use `output: "standalone"`** in `next.config.ts` - it conflicts with `npm start`
- Build command: `npm run build`
- Start command: `mkdir -p /app/data && npx prisma migrate deploy && npm start`

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
- Categories must match: CAREER, HEALTH, CREATIVE, RELATIONSHIPS, FINANCIAL, HOME
- Description is optional

## Important: Category Type Locations

The `Category` type is defined in **two places** - keep them in sync:
1. `src/types/index.ts` - Main type + `CATEGORY_COLORS` mapping
2. `src/lib/csv-parser.ts` - Local type + `VALID_CATEGORIES` array

When adding/removing categories, update both files.

## Logo & Branding

The logo features "BINGOALS" with the "O" as a red bingo dabber mark with a checkmark cutout in negative space.

**Logo effect parameters** (in `design/logo/logo-final.html`):
- Stipple Amount: 2.3
- Stipple Frequency: 0.140
- Watercolor Intensity: 0.53
- Watercolor Frequency: 0.040
- Edge Scale: 5.80

**To regenerate PNGs:**
1. Open `design/logo/logo.svg` in GIMP/Inkscape
2. Export as PNG with transparent background
3. Save to `public/logo-light.png`

The logo uses SVG filters (`feTurbulence`, `feDisplacementMap`) to create a distressed ink effect that mimics real bingo dabber marks.

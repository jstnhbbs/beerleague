# Beer League Almanac

Interactive fantasy football league history for Beer League — manager rankings, season standings, championships, dues tracking, and admin tools.

Built with Next.js, Drizzle ORM, and Turso.

## Features

- Manager rankings and career profiles
- Year-by-year season standings
- Championship history
- Dues tracker for active managers
- Admin dashboard for league updates
- Legacy Google Sheets archive (admin only)

## Getting Started

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Fill in your Turso credentials and admin settings in `.env`, then push the schema:

```bash
npm run db:push
```

Import league history from the spreadsheet (optional):

```bash
npm run import
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | Turso/libSQL database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `ADMIN_PASSWORD` | Password for `/admin` login |
| `ADMIN_SESSION_SECRET` | Secret for signing admin session cookies |
| `SPREADSHEET_PATH` | Local path to import spreadsheet (import script only) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema to Turso |
| `npm run import` | Import spreadsheet data |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment (Vercel)

This app is deployed on Vercel. GitHub Pages is no longer used.

1. Connect the GitHub repo to Vercel.
2. Set the environment variables listed above in the Vercel project settings.
3. Deploy from `main`.

The `vercel-build` script runs `db:push` before `next build`, so schema changes are applied automatically on deploy.

### Disable GitHub Pages

If this repo previously used GitHub Pages, disable it in GitHub:

**Settings → Pages → Source → None**

That prevents the old static site from staying live at `https://<username>.github.io/beerleague/`.

## Project Structure

- `app/` — Next.js App Router pages and API routes
- `components/` — Shared UI components
- `lib/` — Database, queries, auth, and stats
- `scripts/` — Data import utilities

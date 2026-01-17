# Beer League Stats

A Next.js application for displaying team statistics from Google Sheets.

## Features

- Landing page with links to all 10 teams
- Rules page with league information
- Individual team pages displaying Google Sheets with stats
- Modern, responsive design

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration

To update the Google Sheet URLs for each team, edit the `teamSheets` object in `app/teams/[teamId]/page.tsx`.

To update team names, edit the `teamNames` object in the same file.

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Landing page
  - `rules/` - Rules page
  - `teams/[teamId]/` - Dynamic team pages
- `components/` - Reusable components
  - `Navigation.tsx` - Navigation bar

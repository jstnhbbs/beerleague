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

## Deployment to GitHub Pages

This app is configured for automatic deployment to GitHub Pages.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository settings on GitHub
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Update the base path (if needed):**
   - If your repository name is not `beerleague`, update the `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy.yml`
   - Change `/beerleague` to match your repository name (e.g., `/your-repo-name`)

3. **Push to main branch:**
   - The GitHub Actions workflow will automatically build and deploy your site
   - After the workflow completes, your site will be available at `https://yourusername.github.io/beerleague/`

### Manual Build

To build the static site locally:

```bash
npm run build
```

The static files will be in the `out` directory.

### Local Development with Base Path

To test locally with the GitHub Pages base path:

```bash
NEXT_PUBLIC_BASE_PATH=/beerleague npm run dev
```

Then visit `http://localhost:3000/beerleague`

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Landing page
  - `rules/` - Rules page
  - `teams/[teamId]/` - Dynamic team pages
- `components/` - Reusable components
  - `Navigation.tsx` - Navigation bar
- `.github/workflows/` - GitHub Actions workflows
  - `deploy.yml` - Automatic deployment to GitHub Pages
# Trigger deployment

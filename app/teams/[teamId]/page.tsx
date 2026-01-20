import { notFound } from 'next/navigation'
import './team.css'

// Team configuration - you can update these with actual Google Sheet URLs
const teamSheets: Record<string, string> = {
    '1': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1978093567&single=true',
    '2': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1100028925&single=true',
    '3': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=581855790&single=true',
    '4': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=505574005&single=true',
    '5': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
    '6': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
    '7': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
    '8': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
    '9': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
    '10': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?widget=true&headers=false',
}

const teamNames: Record<string, string> = {
    '1': 'The Gnats',
    '2': 'A Team Has No Name',
    '3': 'Compete Ass',
    '4': 'Frodo Tea Baggins',
    '5': 'M@',
    '6': 'Uncle Rico Dynamite',
    '7': 'Keepers Are Gay',
    '8': 'ZiegenBrock',
    '9': 'Golden Shower',
    '10': 'DDT',
}

interface TeamPageProps {
    params: {
        teamId: string
    }
}

// /teams/[teamId]/page.js

export async function generateStaticParams() {
    // Replace with logic to retrieve your team IDs, e.g., from a database or data file
    const teams = [{ teamId: '1' }, { teamId: '2' }]; // Example
  
    return teams.map(team => ({
      teamId: team.teamId,
    }));
  }
  
//   // Your regular page component below
//   export default function TeamPage({ params }) {
//     // ...
//   }

// // Generate static params for all teams at build time
// export function generateStaticParams() {
//     return Array.from({ length: 10 }, (_, i) => ({
//         teamId: String(i + 1),
//     }))
// }

export default function TeamPage({ params }: TeamPageProps) {
    const { teamId } = params
    const sheetUrl = teamSheets[teamId]
    const teamName = teamNames[teamId]

    if (!sheetUrl || !teamName) {
        notFound()
    }

    return (
        <div className="container">
            <div className="team-header">
                <h1 className="team-title">{teamName} Statistics</h1>
            </div>

            <div className="sheet-container">
                <iframe
                    src={sheetUrl}
                    className="stats-sheet"
                    title={`${teamName} Statistics`}
                />
            </div>
        </div>
    )
}

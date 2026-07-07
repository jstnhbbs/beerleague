import Link from 'next/link'
import '../almanac.css'

const archiveTeams = [
    { id: '1', name: 'The Gnats' },
    { id: '2', name: 'A Team Has No Name' },
    { id: '3', name: 'Complete Ass' },
    { id: '4', name: 'Frodo Tea Baggins' },
    { id: '5', name: 'M@' },
    { id: '6', name: 'Uncle Rico Dynamite' },
    { id: '7', name: 'Keepers Are Gay' },
    { id: '8', name: 'ZiegenBrock' },
    { id: '9', name: 'Golden Shower' },
    { id: '10', name: 'DDT' },
]

export default function ArchivePage() {
    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Legacy Views</p>
                <h1 className="almanac-title">Stats Archive</h1>
                <p className="almanac-subtitle">
                    The original Google Sheets team stat pages, preserved while
                    the new almanac is built out.
                </p>
            </header>

            <p className="archive-note">
                These pages embed the live Google Sheets from the previous site.
                New league history lives in the almanac sections — Managers,
                Seasons, and Championships.
            </p>

            <div className="almanac-grid">
                {archiveTeams.map((team) => (
                    <Link
                        key={team.id}
                        href={`/archive/teams/${team.id}`}
                        className="almanac-card"
                    >
                        <h2>{team.name}</h2>
                        <p>Open legacy Google Sheets stats →</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

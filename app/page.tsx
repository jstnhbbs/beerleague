import Link from 'next/link'
import './home.css'

const teams = [
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

export default function Home() {
    return (
        <div className="container">
            <div className="hero">
                <h1 className="title">Beer League Stats</h1>
                <p className="subtitle">View statistics and standings for all teams</p>
            </div>

            <div className="teams-grid">
                {teams.map((team) => {
                    // Add 'featured' class to teams you want to distinguish (change IDs as needed)
                    const isWinner = team.id === '6' 
                    const isLoser = team.id === '8'
                    return (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className={`team-card ${isWinner ? 'team-card-winner' : isLoser ? 'team-card-loser' : ''}`}
                        >
                            <div className="team-card-content">
                                <h2>{team.name}</h2>
                                <p>View Stats →</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

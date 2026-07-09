import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getManagerProfile } from '@/lib/queries'
import { formatCareerRecord, formatCareerWinPct } from '@/lib/stats'
import { formatRecord } from '@/lib/utils'
import '../../almanac.css'

export { dynamic } from '@/lib/db/route-config'

interface ManagerPageProps {
    params: {
        slug: string
    }
}

export default async function ManagerPage({ params }: ManagerPageProps) {
    const profile = await getManagerProfile(params.slug)
    if (!profile) notFound()

    const { manager, entries, stats } = profile

    return (
        <div className="container">
            <header className="manager-header">
                <div>
                    <p className="almanac-eyebrow">Manager Profile</p>
                    <h1>{manager.name}</h1>
                    <p className="manager-meta">
                        {stats.currentTeamName
                            ? `Latest team: ${stats.currentTeamName}`
                            : 'League manager'}
                    </p>
                </div>
                <div className="manager-highlights">
                    <span className="highlight-pill">
                        <strong>{stats.championships}</strong> titles
                    </span>
                    <span className="highlight-pill">
                        <strong>{formatCareerRecord(stats)}</strong> career
                    </span>
                    <span className="highlight-pill">
                        <strong>{formatCareerWinPct(stats)}</strong> win %
                    </span>
                    <span className="highlight-pill">
                        <strong>{stats.avgFinish?.toFixed(1) ?? '—'}</strong> avg
                        finish
                    </span>
                </div>
            </header>

            <div className="almanac-stat-strip">
                <div className="almanac-stat">
                    <div className="almanac-stat-value">{stats.seasons}</div>
                    <div className="almanac-stat-label">Seasons</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {stats.playoffAppearances}
                    </div>
                    <div className="almanac-stat-label">Playoff Apps</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {stats.avgPointsFor.toFixed(0)}
                    </div>
                    <div className="almanac-stat-label">Avg Pts For</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {stats.bestFinish ?? '—'}
                    </div>
                    <div className="almanac-stat-label">Best Finish</div>
                </div>
            </div>

            <h2 className="almanac-section-title">Season History</h2>
            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Team</th>
                            <th>Finish</th>
                            <th>Record</th>
                            <th>Pts For</th>
                            <th>Pts Against</th>
                            <th>Margin</th>
                            <th>Playoffs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry) => (
                            <tr
                                key={entry.id}
                                className={
                                    entry.championshipWon ? 'champion-row' : ''
                                }
                            >
                                <td
                                    className="almanac-row-title"
                                    data-label="Year"
                                >
                                    <Link href={`/seasons/${entry.year}`}>
                                        {entry.year}
                                    </Link>
                                </td>
                                <td data-label="Team">
                                    {entry.teamName}
                                    {entry.championshipWon && (
                                        <span className="champion-badge">
                                            Champ
                                        </span>
                                    )}
                                </td>
                                <td className="num" data-label="Finish">
                                    {entry.finish}
                                </td>
                                <td className="num" data-label="Record">
                                    {formatRecord(
                                        entry.regularSeasonWins,
                                        entry.regularSeasonLosses,
                                        entry.regularSeasonTies
                                    )}
                                </td>
                                <td className="num" data-label="Pts For">
                                    {entry.pointsFor.toFixed(0)}
                                </td>
                                <td className="num" data-label="Pts Against">
                                    {entry.pointsAgainst.toFixed(0)}
                                </td>
                                <td className="num" data-label="Margin">
                                    {(
                                        entry.pointsFor - entry.pointsAgainst
                                    ).toFixed(0)}
                                </td>
                                <td className="num" data-label="Playoffs">
                                    {entry.playoffAppearance
                                        ? formatRecord(
                                              entry.playoffWins,
                                              entry.playoffLosses
                                          )
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

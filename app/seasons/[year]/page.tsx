import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeasonStandings } from '@/lib/queries'
import { formatRecord } from '@/lib/utils'
import '../../almanac.css'

export { dynamic } from '@/lib/db/route-config'

interface SeasonPageProps {
    params: {
        year: string
    }
}

export default async function SeasonPage({ params }: SeasonPageProps) {
    const year = Number(params.year)
    if (!Number.isFinite(year)) notFound()

    const standings = await getSeasonStandings(year)
    if (standings.length === 0) notFound()

    const champion = standings.find((row) => row.championshipWon)
    const topScorer = [...standings].sort((a, b) => b.pointsFor - a.pointsFor)[0]
    const toughestSchedule = [...standings].sort(
        (a, b) => b.pointsAgainst - a.pointsAgainst
    )[0]
    const playoffTeams = standings.filter((row) => row.playoffAppearance)
    const avgPointsFor =
        standings.reduce((sum, row) => sum + row.pointsFor, 0) / standings.length

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Final Standings</p>
                <h1 className="almanac-title">{year} Season</h1>
                <p className="almanac-subtitle">
                    Champions highlighted in gold. Playoff teams marked with a
                    star.
                </p>
            </header>

            <div className="almanac-stat-strip">
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {champion?.teamName ?? '—'}
                    </div>
                    <div className="almanac-stat-label">
                        Champion{champion ? ` · ${champion.managerName}` : ''}
                    </div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {topScorer?.pointsFor.toFixed(0) ?? '—'}
                    </div>
                    <div className="almanac-stat-label">
                        Top Points For{topScorer ? ` · ${topScorer.managerName}` : ''}
                    </div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {avgPointsFor.toFixed(0)}
                    </div>
                    <div className="almanac-stat-label">Avg Points For</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {toughestSchedule?.pointsAgainst.toFixed(0) ?? '—'}
                    </div>
                    <div className="almanac-stat-label">
                        Toughest Schedule
                        {toughestSchedule ? ` · ${toughestSchedule.managerName}` : ''}
                    </div>
                </div>
            </div>

            {playoffTeams.length > 0 && (
                <>
                    <h2 className="almanac-section-title">Playoff Snapshot</h2>
                    <div className="almanac-table-wrap season-playoff-table-wrap">
                        <table className="almanac-table">
                            <thead>
                                <tr>
                                    <th>Seed</th>
                                    <th>Team</th>
                                    <th>Manager</th>
                                    <th>Playoff Record</th>
                                    <th>Bye</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playoffTeams.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={
                                            row.championshipWon
                                                ? 'champion-row'
                                                : ''
                                        }
                                    >
                                        <td
                                            className="rank-cell num"
                                            data-label="Seed"
                                        >
                                            {row.finish}
                                        </td>
                                        <td
                                            className="almanac-row-title"
                                            data-label="Team"
                                        >
                                            {row.teamName}
                                            {row.championshipWon && (
                                                <span className="champion-badge">
                                                    Champ
                                                </span>
                                            )}
                                        </td>
                                        <td data-label="Manager">
                                            <Link
                                                href={`/managers/${row.managerSlug}`}
                                            >
                                                {row.managerName}
                                            </Link>
                                        </td>
                                        <td
                                            className="num"
                                            data-label="Playoff Record"
                                        >
                                            {formatRecord(
                                                row.playoffWins,
                                                row.playoffLosses
                                            )}
                                        </td>
                                        <td className="num" data-label="Bye">
                                            {row.playoffBye ? 'Yes' : 'No'}
                                        </td>
                                        <td data-label="Result">
                                            {row.championshipWon
                                                ? 'Champion'
                                                : row.finish === 2
                                                  ? 'Runner-up'
                                                  : 'Playoffs'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <h2 className="almanac-section-title">Final Standings</h2>
            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>Finish</th>
                            <th>Team</th>
                            <th>Manager</th>
                            <th>Record</th>
                            <th>Pts For</th>
                            <th>Pts Against</th>
                            <th>Margin</th>
                            <th>PR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row) => (
                            <tr
                                key={row.id}
                                className={
                                    row.championshipWon ? 'champion-row' : ''
                                }
                            >
                                <td className="rank-cell num" data-label="Finish">
                                    {row.playoffAppearance ? '*' : ''}
                                    {row.finish}
                                </td>
                                <td
                                    className="almanac-row-title"
                                    data-label="Team"
                                >
                                    {row.teamName}
                                    {row.championshipWon && (
                                        <span className="champion-badge">
                                            Champ
                                        </span>
                                    )}
                                </td>
                                <td data-label="Manager">
                                    <Link
                                        href={`/managers/${row.managerSlug}`}
                                    >
                                        {row.managerName}
                                    </Link>
                                </td>
                                <td className="num" data-label="Record">
                                    {formatRecord(
                                        row.regularSeasonWins,
                                        row.regularSeasonLosses,
                                        row.regularSeasonTies
                                    )}
                                </td>
                                <td className="num" data-label="Pts For">
                                    {row.pointsFor.toFixed(0)}
                                </td>
                                <td className="num" data-label="Pts Against">
                                    {row.pointsAgainst.toFixed(0)}
                                </td>
                                <td className="num" data-label="Margin">
                                    {(
                                        row.pointsFor - row.pointsAgainst
                                    ).toFixed(0)}
                                </td>
                                <td className="num" data-label="PR">
                                    {row.powerRating?.toFixed(1) ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

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
                                <td className="rank-cell num">
                                    {row.playoffAppearance ? '*' : ''}
                                    {row.finish}
                                </td>
                                <td>
                                    {row.teamName}
                                    {row.championshipWon && (
                                        <span className="champion-badge">
                                            Champ
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <Link
                                        href={`/managers/${row.managerSlug}`}
                                    >
                                        {row.managerName}
                                    </Link>
                                </td>
                                <td className="num">
                                    {formatRecord(
                                        row.regularSeasonWins,
                                        row.regularSeasonLosses,
                                        row.regularSeasonTies
                                    )}
                                </td>
                                <td className="num">
                                    {row.pointsFor.toFixed(0)}
                                </td>
                                <td className="num">
                                    {row.pointsAgainst.toFixed(0)}
                                </td>
                                <td className="num">
                                    {(
                                        row.pointsFor - row.pointsAgainst
                                    ).toFixed(0)}
                                </td>
                                <td className="num">
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

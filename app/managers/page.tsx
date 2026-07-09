import Link from 'next/link'
import { getManagerRankings } from '@/lib/queries'
import { formatCareerRecord, formatCareerWinPct } from '@/lib/stats'
import '../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function ManagersPage() {
    const rankings = await getManagerRankings()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Career Leaders</p>
                <h1 className="almanac-title">Manager Rankings</h1>
                <p className="almanac-subtitle">
                    Sorted by seasons played, then championships, then career
                    win percentage.
                </p>
            </header>

            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Manager</th>
                            <th>Current Team</th>
                            <th>Seasons</th>
                            <th>Record</th>
                            <th>Win %</th>
                            <th>Avg PR</th>
                            <th>Titles</th>
                            <th>Playoffs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((row) => (
                            <tr key={row.managerId}>
                                <td className="rank-cell num" data-label="#">
                                    {row.rank}
                                </td>
                                <td className="almanac-row-title" data-label="Manager">
                                    <Link href={`/managers/${row.slug}`}>
                                        {row.name}
                                    </Link>
                                </td>
                                <td data-label="Current Team">
                                    {row.stats.currentTeamName ?? '—'}
                                </td>
                                <td className="num" data-label="Seasons">
                                    {row.stats.seasons}
                                </td>
                                <td className="num" data-label="Record">
                                    {formatCareerRecord(row.stats)}
                                </td>
                                <td className="num" data-label="Win %">
                                    {formatCareerWinPct(row.stats)}
                                </td>
                                <td className="num" data-label="Avg PR">
                                    {row.stats.avgPowerRating?.toFixed(1) ?? '—'}
                                </td>
                                <td className="num" data-label="Titles">
                                    {row.stats.championships}
                                </td>
                                <td className="num" data-label="Playoffs">
                                    {row.stats.playoffAppearances}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

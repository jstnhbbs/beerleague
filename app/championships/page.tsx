import Link from 'next/link'
import { getChampionships } from '@/lib/queries'
import '../almanac.css'

export default async function ChampionshipsPage() {
    const championships = await getChampionships()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Title Town</p>
                <h1 className="almanac-title">Championship Seasons</h1>
                <p className="almanac-subtitle">
                    Every championship run since 2015, with records and scoring
                    margins.
                </p>
            </header>

            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Champion</th>
                            <th>Manager</th>
                            <th>Reg. Season</th>
                            <th>Pts For</th>
                            <th>Pts Against</th>
                            <th>Margin</th>
                            <th>Playoffs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {championships.map((row) => (
                            <tr key={row.year} className="champion-row">
                                <td>
                                    <Link href={`/seasons/${row.year}`}>
                                        {row.year}
                                    </Link>
                                </td>
                                <td>{row.teamName}</td>
                                <td>
                                    <Link
                                        href={`/managers/${row.managerSlug}`}
                                    >
                                        {row.managerName}
                                    </Link>
                                </td>
                                <td className="num">{row.record}</td>
                                <td className="num">
                                    {row.pointsFor.toFixed(0)}
                                </td>
                                <td className="num">
                                    {row.pointsAgainst.toFixed(0)}
                                </td>
                                <td className="num">
                                    {row.margin.toFixed(0)}
                                </td>
                                <td className="num">{row.playoffRecord}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    getManagerHeadToHeadRows,
    getManagerHeadToHeadSummary,
} from '@/lib/head-to-head'
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
    const bestSeason = [...entries].sort((a, b) => a.finish - b.finish)[0]
    const topScoringSeason = [...entries].sort(
        (a, b) => b.pointsFor - a.pointsFor
    )[0]
    const toughestScheduleSeason = [...entries].sort(
        (a, b) => b.pointsAgainst - a.pointsAgainst
    )[0]
    const h2hSummary = getManagerHeadToHeadSummary(manager.name)
    const rivalryRows = getManagerHeadToHeadRows(manager.name)
        .filter((matchup) => matchup.games > 0)
        .sort((a, b) => b.games - a.games || b.wins - a.wins)
        .slice(0, 6)

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
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {formatRecord(stats.playoffWins, stats.playoffLosses)}
                    </div>
                    <div className="almanac-stat-label">Playoff Record</div>
                </div>
            </div>

            <section className="manager-insight-grid" aria-label="Manager insights">
                <div className="manager-insight-card">
                    <span>Best Season</span>
                    <strong>
                        {bestSeason
                            ? `${bestSeason.year} · ${bestSeason.teamName}`
                            : '—'}
                    </strong>
                    <p>
                        {bestSeason
                            ? `Finished ${bestSeason.finish} with a ${formatRecord(
                                  bestSeason.regularSeasonWins,
                                  bestSeason.regularSeasonLosses,
                                  bestSeason.regularSeasonTies
                              )} regular-season record.`
                            : 'No seasons logged.'}
                    </p>
                </div>
                <div className="manager-insight-card">
                    <span>Top Scoring Season</span>
                    <strong>
                        {topScoringSeason
                            ? `${topScoringSeason.pointsFor.toFixed(0)} pts`
                            : '—'}
                    </strong>
                    <p>
                        {topScoringSeason
                            ? `${topScoringSeason.year} ${topScoringSeason.teamName}`
                            : 'No scoring data logged.'}
                    </p>
                </div>
                <div className="manager-insight-card">
                    <span>Toughest Schedule</span>
                    <strong>
                        {toughestScheduleSeason
                            ? `${toughestScheduleSeason.pointsAgainst.toFixed(0)} PA`
                            : '—'}
                    </strong>
                    <p>
                        {toughestScheduleSeason
                            ? `${toughestScheduleSeason.year} ${toughestScheduleSeason.teamName}`
                            : 'No schedule strength data logged.'}
                    </p>
                </div>
                <div className="manager-insight-card">
                    <span>Head-to-Head</span>
                    <strong>
                        {h2hSummary
                            ? formatRecord(
                                  h2hSummary.wins,
                                  h2hSummary.losses,
                                  h2hSummary.ties
                              )
                            : '—'}
                    </strong>
                    <p>
                        {h2hSummary?.bestMatchup
                            ? `Best vs ${h2hSummary.bestMatchup.opponent}; toughest vs ${h2hSummary.toughestMatchup?.opponent ?? '—'}.`
                            : 'No matchup data logged.'}
                    </p>
                </div>
            </section>

            {rivalryRows.length > 0 && (
                <>
                    <h2 className="almanac-section-title">Rivalry Snapshot</h2>
                    <div className="almanac-table-wrap manager-rivalry-table-wrap">
                        <table className="almanac-table">
                            <thead>
                                <tr>
                                    <th>Opponent</th>
                                    <th>Record</th>
                                    <th>Games</th>
                                    <th>Win %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rivalryRows.map((matchup) => (
                                    <tr key={matchup.opponent}>
                                        <td
                                            className="almanac-row-title"
                                            data-label="Opponent"
                                        >
                                            {matchup.opponent}
                                        </td>
                                        <td className="num" data-label="Record">
                                            {matchup.record}
                                        </td>
                                        <td className="num" data-label="Games">
                                            {matchup.games}
                                        </td>
                                        <td className="num" data-label="Win %">
                                            {matchup.winPct
                                                .toFixed(3)
                                                .replace(/^0/, '')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

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

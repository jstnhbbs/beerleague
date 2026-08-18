import Link from 'next/link'
import { getLeagueSummary } from '@/lib/queries'
import './almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function Home() {
    const summary = await getLeagueSummary()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">EST. 2015</p>
                <h1 className="almanac-title">Beer League Almanac</h1>
                <p className="almanac-subtitle">
                    The complete interactive history of the league — managers,
                    seasons, championships, and the stories behind every roster
                    name.
                </p>
            </header>

            <div className="almanac-stat-strip">
                <div className="almanac-stat">
                    <div className="almanac-stat-value">{summary.managerCount}</div>
                    <div className="almanac-stat-label">Managers</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {summary.firstSeason && summary.latestSeason
                            ? `${summary.firstSeason}–${summary.latestSeason}`
                            : '—'}
                    </div>
                    <div className="almanac-stat-label">Seasons Tracked</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {summary.championshipCount}
                    </div>
                    <div className="almanac-stat-label">Championships</div>
                </div>
                {summary.latestChampion && (
                    <div className="almanac-stat">
                        <div className="almanac-stat-value">
                            {summary.latestChampion.teamName}
                        </div>
                        <div className="almanac-stat-label">
                            Current Champion · {summary.latestChampion.managerName}
                        </div>
                    </div>
                )}
            </div>

            <div className="almanac-grid">
                <Link href="/managers" className="almanac-card">
                    <h2>Manager Rankings</h2>
                    <p>
                        Career power ratings, records, and playoff history for
                        every manager in league history.
                    </p>
                </Link>
                <Link href="/seasons" className="almanac-card">
                    <h2>Season Standings</h2>
                    <p>
                        Year-by-year final standings with records, points, and
                        playoff appearances.
                    </p>
                </Link>
                <Link href="/championships" className="almanac-card">
                    <h2>Championships</h2>
                    <p>
                        Every title run from 2015 to present — the champions,
                        teams, and season stats.
                    </p>
                </Link>
                <Link href="/keepers" className="almanac-card">
                    <h2>Keepers</h2>
                    <p>
                        Current keeper declarations, draft pick costs, and
                        eligibility for the upcoming draft.
                    </p>
                </Link>
            </div>
        </div>
    )
}

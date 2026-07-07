import Link from 'next/link'
import { getLeagueSummary } from '@/lib/queries'
import './almanac.css'

export default async function Home() {
    const summary = await getLeagueSummary()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Est. 2007 · HuskieFantasy</p>
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
                {summary.topChampion && (
                    <div className="almanac-stat">
                        <div className="almanac-stat-value">
                            {summary.topChampion.count}
                        </div>
                        <div className="almanac-stat-label">
                            Titles · {summary.topChampion.name}
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
                <Link href="/archive" className="almanac-card">
                    <h2>Live Stats Archive</h2>
                    <p>
                        The previous Google Sheets team views, kept around while
                        the new almanac grows.
                    </p>
                </Link>
            </div>
        </div>
    )
}

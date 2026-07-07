import Link from 'next/link'
import { getAllSeasonYears } from '@/lib/queries'
import '../almanac.css'

export default async function SeasonsPage() {
    const years = await getAllSeasonYears()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Year by Year</p>
                <h1 className="almanac-title">Season Standings</h1>
                <p className="almanac-subtitle">
                    Browse final standings for every season in league history.
                </p>
            </header>

            <div className="almanac-grid">
                {years.map((year) => (
                    <Link
                        key={year}
                        href={`/seasons/${year}`}
                        className="almanac-card"
                    >
                        <h2>{year} Season</h2>
                        <p>View final standings, records, and point totals.</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

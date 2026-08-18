import { getManagerRankings } from '@/lib/queries'
import { ManagerRankingsTable } from './ManagerRankingsTable'
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

            <ManagerRankingsTable rankings={rankings} />
        </div>
    )
}

import Link from 'next/link'
import {
    KEEPER_RULES,
    displayKeeperValue,
    firstRoundPickColumnLabel,
    keeperSeasonLabel,
    sacrificeColumnLabel,
} from '@/lib/keepers'
import { getKeepersTracker } from '@/lib/queries'
import '../almanac.css'
import './keepers.css'

export { dynamic } from '@/lib/db/route-config'

export default async function KeepersPage() {
    const tracker = await getKeepersTracker()
    const declaredCount = tracker.rows.filter((row) => row.playerKept).length

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">League Business</p>
                <h1 className="almanac-title">Keepers {keeperSeasonLabel()}</h1>
                <p className="almanac-subtitle">
                    {tracker.rows.length > 0
                        ? `${declaredCount} of ${tracker.rows.length} active managers have declared a keeper for the ${tracker.keeperDraftYear} draft.`
                        : 'No active season is available yet.'}
                </p>
            </header>

            <div className="almanac-table-wrap">
                <table className="almanac-table keepers-table">
                    <thead>
                        <tr>
                            <th>Team Owner</th>
                            <th>Player Kept</th>
                            <th>Season Drafted</th>
                            <th>Round Kept</th>
                            <th>{sacrificeColumnLabel()}</th>
                            <th>Seasons on Roster</th>
                            <th>{firstRoundPickColumnLabel()}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracker.rows.map((row) => (
                            <tr key={row.managerId}>
                                <td
                                    className="almanac-row-title"
                                    data-label="Team Owner"
                                >
                                    <Link href={`/managers/${row.managerSlug}`}>
                                        {row.managerName}
                                    </Link>
                                </td>
                                <td data-label="Player Kept">
                                    {displayKeeperValue(row.playerKept)}
                                </td>
                                <td data-label="Season Drafted">
                                    {displayKeeperValue(row.seasonDrafted)}
                                </td>
                                <td data-label="Round Kept">
                                    {displayKeeperValue(row.roundKept)}
                                </td>
                                <td data-label={sacrificeColumnLabel()}>
                                    {row.sacrificeRound ? (
                                        <span
                                            className={
                                                row.sacrificeRound ===
                                                'Not Eligible'
                                                    ? 'keepers-ineligible'
                                                    : undefined
                                            }
                                        >
                                            {row.sacrificeRound}
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td data-label="Seasons on Roster">
                                    {displayKeeperValue(row.seasonsOnRoster)}
                                </td>
                                <td data-label={firstRoundPickColumnLabel()}>
                                    {displayKeeperValue(row.firstRoundPick)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <section className="keepers-rules">
                <div className="keepers-rules-heading">
                    <h2 className="keepers-rules-title">Keeper Rules</h2>
                    <Link href="/rules#keeper-rules" className="text-link">
                        View in League Rules
                    </Link>
                </div>
                <ul className="keepers-rules-list">
                    {KEEPER_RULES.map((rule) => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ul>
            </section>
        </div>
    )
}

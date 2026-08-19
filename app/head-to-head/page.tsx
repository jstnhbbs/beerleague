import {
    headToHeadManagers,
    headToHeadMatrix,
    headToHeadSeasonCounts,
    headToHeadSourceGameCount,
} from '@/lib/head-to-head'
import HeadToHeadSelector from './HeadToHeadSelector'
import '../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default function HeadToHeadPage() {
    const seasons = Object.entries(headToHeadSeasonCounts)
    const sortedManagers = [...headToHeadManagers].sort((a, b) =>
        a.localeCompare(b),
    )
    const matrixByManager = new Map(
        headToHeadMatrix.map((row) => [row.manager, row]),
    )
    const originalManagerIndex = new Map(
        headToHeadManagers.map((manager, index) => [manager, index]),
    )
    const sortedMatrix = sortedManagers.map((manager) => {
        const sourceRow = matrixByManager.get(manager)
        return {
            manager,
            records: sortedManagers.map((opponent) => {
                const recordIndex = originalManagerIndex.get(opponent)
                if (!sourceRow || recordIndex === undefined) {
                    return '0-0'
                }
                return sourceRow.records[recordIndex] ?? '0-0'
            }),
        }
    })

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Manager Matchups</p>
                <h1 className="almanac-title">Head-to-Head Records</h1>
                <p className="almanac-subtitle">
                    Cumulative manager records built from 2015-2025 league
                    schedule history.
                </p>
            </header>

            <div className="almanac-stat-strip">
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {headToHeadManagers.length}
                    </div>
                    <div className="almanac-stat-label">Managers</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {headToHeadSourceGameCount}
                    </div>
                    <div className="almanac-stat-label">Games Logged</div>
                </div>
                <div className="almanac-stat">
                    <div className="almanac-stat-value">
                        {seasons.at(0)?.[0]}-{seasons.at(-1)?.[0]}
                    </div>
                    <div className="almanac-stat-label">Seasons</div>
                </div>
            </div>

            <div className="h2h-layout">
                <section>
                    <HeadToHeadSelector
                        managers={sortedManagers}
                        matrix={sortedMatrix}
                    />

                    <h2 className="almanac-section-title">
                        Manager Matrix
                    </h2>
                    <div className="almanac-table-wrap h2h-table-wrap">
                        <table className="almanac-table h2h-table">
                            <thead>
                                <tr>
                                    <th className="h2h-sticky h2h-corner">
                                        Manager
                                    </th>
                                    {sortedManagers.map((manager) => (
                                        <th key={manager}>{manager}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMatrix.map((row) => (
                                    <tr key={row.manager}>
                                        <th
                                            className="h2h-sticky"
                                            scope="row"
                                        >
                                            {row.manager}
                                        </th>
                                        {row.records.map((record, index) => {
                                            const isSelf = record === '-'
                                            return (
                                                <td
                                                    key={`${row.manager}-${sortedManagers[index]}`}
                                                    className={
                                                        isSelf
                                                            ? 'num h2h-self'
                                                            : 'num'
                                                    }
                                                    data-label={
                                                        sortedManagers[index]
                                                    }
                                                >
                                                    {record}
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    )
}

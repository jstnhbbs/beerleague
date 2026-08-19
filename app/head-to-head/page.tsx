import {
    headToHeadManagers,
    headToHeadMatrix,
    headToHeadNotes,
    headToHeadSeasonCounts,
    headToHeadSourceGameCount,
} from '@/lib/head-to-head'
import '../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default function HeadToHeadPage() {
    const seasons = Object.entries(headToHeadSeasonCounts)

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
                                    {headToHeadManagers.map((manager) => (
                                        <th key={manager}>{manager}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {headToHeadMatrix.map((row) => (
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
                                                    key={`${row.manager}-${headToHeadManagers[index]}`}
                                                    className={
                                                        isSelf
                                                            ? 'num h2h-self'
                                                            : 'num'
                                                    }
                                                    data-label={
                                                        headToHeadManagers[
                                                            index
                                                        ]
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

                <aside className="h2h-notes">
                    <h2>Source Notes</h2>
                    {headToHeadNotes.map((note) => (
                        <p key={note}>{note}</p>
                    ))}

                    <h3>Games by Season</h3>
                    <dl className="h2h-season-counts">
                        {seasons.map(([year, count]) => (
                            <div key={year}>
                                <dt>{year}</dt>
                                <dd>{count}</dd>
                            </div>
                        ))}
                    </dl>
                </aside>
            </div>
        </div>
    )
}

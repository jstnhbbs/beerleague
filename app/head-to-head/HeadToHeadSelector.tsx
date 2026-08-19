'use client'

import { useMemo, useState } from 'react'
import type { HeadToHeadMatrixRow } from '@/lib/head-to-head'

interface HeadToHeadSelectorProps {
    managers: readonly string[]
    matrix: HeadToHeadMatrixRow[]
}

export default function HeadToHeadSelector({
    managers,
    matrix,
}: HeadToHeadSelectorProps) {
    const [selectedManager, setSelectedManager] = useState(managers[0] ?? '')

    const selectedRow = useMemo(
        () => matrix.find((row) => row.manager === selectedManager),
        [matrix, selectedManager],
    )

    const matchupRows = managers
        .map((opponent, index) => ({
            opponent,
            record: selectedRow?.records[index] ?? '0-0',
        }))
        .filter((matchup) => matchup.opponent !== selectedManager)

    return (
        <section className="h2h-manager-card" aria-label="Manager head to head">
            <div className="h2h-manager-controls">
                <label htmlFor="h2h-manager-select">
                    Manager Head-to-Head
                </label>
                <select
                    id="h2h-manager-select"
                    className="admin-select h2h-manager-select"
                    value={selectedManager}
                    onChange={(event) => setSelectedManager(event.target.value)}
                >
                    {managers.map((manager) => (
                        <option key={manager} value={manager}>
                            {manager}
                        </option>
                    ))}
                </select>
            </div>

            <div className="almanac-table-wrap h2h-manager-table-wrap">
                <table className="almanac-table h2h-manager-table">
                    <thead>
                        <tr>
                            <th>Opponent</th>
                            <th>Record</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matchupRows.map((matchup) => (
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

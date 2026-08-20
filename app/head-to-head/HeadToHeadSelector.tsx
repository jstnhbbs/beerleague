'use client'

import { useMemo, useState } from 'react'
import {
    formatHeadToHeadRecord,
    parseHeadToHeadRecord,
    type HeadToHeadMatrixRow,
} from '@/lib/head-to-head'

interface HeadToHeadSelectorProps {
    managers: readonly string[]
    matrix: HeadToHeadMatrixRow[]
}

export default function HeadToHeadSelector({
    managers,
    matrix,
}: HeadToHeadSelectorProps) {
    const [selectedManager, setSelectedManager] = useState('')
    const [matchupFilter, setMatchupFilter] = useState('all')

    const selectedRow = useMemo(
        () => matrix.find((row) => row.manager === selectedManager),
        [matrix, selectedManager],
    )

    const matchupRows = useMemo(
        () =>
            managers
                .map((opponent, index) => {
                    const record = selectedRow?.records[index] ?? '0-0'
                    return {
                        opponent,
                        record,
                        ...parseHeadToHeadRecord(record),
                    }
                })
                .filter((matchup) => matchup.opponent !== selectedManager),
        [managers, selectedManager, selectedRow],
    )

    const summary = useMemo(() => {
        const totals = matchupRows.reduce(
            (sum, matchup) => ({
                wins: sum.wins + matchup.wins,
                losses: sum.losses + matchup.losses,
                ties: sum.ties + matchup.ties,
            }),
            { wins: 0, losses: 0, ties: 0 },
        )
        const games = totals.wins + totals.losses + totals.ties
        const played = matchupRows.filter((matchup) => matchup.games > 0)
        const ranked = [...played].sort((a, b) => {
            const bValue = b.winPct * 1000 + b.wins - b.losses
            const aValue = a.winPct * 1000 + a.wins - a.losses
            return bValue - aValue
        })

        return {
            wins: totals.wins,
            losses: totals.losses,
            ties: totals.ties,
            games,
            winPct: games > 0 ? (totals.wins + totals.ties * 0.5) / games : 0,
            bestMatchup: ranked[0] ?? null,
            toughestMatchup: ranked.at(-1) ?? null,
        }
    }, [matchupRows])

    const filteredMatchupRows = matchupRows.filter((matchup) => {
        if (matchupFilter === 'winning') return matchup.wins > matchup.losses
        if (matchupFilter === 'losing') return matchup.losses > matchup.wins
        if (matchupFilter === 'even') {
            return matchup.games > 0 && matchup.wins === matchup.losses
        }
        if (matchupFilter === 'played') return matchup.games > 0
        return true
    })

    const selectedRecord = formatHeadToHeadRecord(summary)

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
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                        <option key={manager} value={manager}>
                            {manager}
                        </option>
                    ))}
                </select>
            </div>

            {selectedManager ? (
                <>
                    <div className="h2h-summary-grid">
                        <div className="h2h-summary-card">
                            <span>Overall</span>
                            <strong>{selectedRecord}</strong>
                        </div>
                        <div className="h2h-summary-card">
                            <span>Win %</span>
                            <strong>
                                {summary.winPct.toFixed(3).replace(/^0/, '')}
                            </strong>
                        </div>
                        <div className="h2h-summary-card">
                            <span>Best Matchup</span>
                            <strong>
                                {summary.bestMatchup
                                    ? `${summary.bestMatchup.opponent} (${summary.bestMatchup.record})`
                                    : '—'}
                            </strong>
                        </div>
                        <div className="h2h-summary-card">
                            <span>Toughest Matchup</span>
                            <strong>
                                {summary.toughestMatchup
                                    ? `${summary.toughestMatchup.opponent} (${summary.toughestMatchup.record})`
                                    : '—'}
                            </strong>
                        </div>
                    </div>

                    <div className="h2h-filter-row" aria-label="Matchup filters">
                        {[
                            ['all', 'All'],
                            ['played', 'Played'],
                            ['winning', 'Winning'],
                            ['losing', 'Losing'],
                            ['even', 'Even'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                className="h2h-filter-button"
                                aria-pressed={matchupFilter === value}
                                onClick={() => setMatchupFilter(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="almanac-table-wrap h2h-manager-table-wrap">
                        <table className="almanac-table h2h-manager-table">
                            <thead>
                                <tr>
                                    <th>Opponent</th>
                                    <th>Record</th>
                                    <th>Games</th>
                                    <th>Win %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMatchupRows.map((matchup) => (
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
                                            {matchup.games > 0
                                                ? matchup.winPct
                                                      .toFixed(3)
                                                      .replace(/^0/, '')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : null}
        </section>
    )
}

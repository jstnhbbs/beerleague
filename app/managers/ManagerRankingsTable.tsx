'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ManagerRankingRow } from '@/lib/queries'
import { formatCareerRecord, formatCareerWinPct } from '@/lib/stats'

type SortKey =
    | 'rank'
    | 'manager'
    | 'currentTeam'
    | 'seasons'
    | 'record'
    | 'winPct'
    | 'avgPowerRating'
    | 'championships'
    | 'playoffAppearances'

type SortDirection = 'asc' | 'desc'

interface SortConfig {
    key: SortKey
    direction: SortDirection
}

interface ManagerRankingsTableProps {
    rankings: ManagerRankingRow[]
}

interface SortColumn {
    key: SortKey
    label: string
    numeric?: boolean
}

const columns: SortColumn[] = [
    { key: 'rank', label: '#', numeric: true },
    { key: 'manager', label: 'Manager' },
    { key: 'currentTeam', label: 'Current Team' },
    { key: 'seasons', label: 'Seasons', numeric: true },
    { key: 'record', label: 'Record', numeric: true },
    { key: 'winPct', label: 'Win %', numeric: true },
    { key: 'avgPowerRating', label: 'Avg PR', numeric: true },
    { key: 'championships', label: 'Titles', numeric: true },
    { key: 'playoffAppearances', label: 'Playoffs', numeric: true },
]

function winPctValue(row: ManagerRankingRow): number {
    const { totalWins, totalLosses, totalTies } = row.stats
    const decisions = totalWins + totalLosses + totalTies
    if (decisions === 0) return 0
    return (totalWins + totalTies * 0.5) / decisions
}

function sortValue(row: ManagerRankingRow, key: SortKey): string | number {
    switch (key) {
        case 'rank':
            return row.rank
        case 'manager':
            return row.name
        case 'currentTeam':
            return row.stats.currentTeamName ?? ''
        case 'seasons':
            return row.stats.seasons
        case 'record':
            return row.stats.totalWins
        case 'winPct':
            return winPctValue(row)
        case 'avgPowerRating':
            return row.stats.avgPowerRating ?? Number.NEGATIVE_INFINITY
        case 'championships':
            return row.stats.championships
        case 'playoffAppearances':
            return row.stats.playoffAppearances
    }
}

function compareRows(
    a: ManagerRankingRow,
    b: ManagerRankingRow,
    sort: SortConfig
): number {
    const aValue = sortValue(a, sort.key)
    const bValue = sortValue(b, sort.key)

    let result =
        typeof aValue === 'number' && typeof bValue === 'number'
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue), undefined, {
                  sensitivity: 'base',
              })

    if (sort.direction === 'desc') result *= -1
    return result || a.rank - b.rank
}

function nextDirection(
    current: SortConfig,
    key: SortKey,
    numeric?: boolean
): SortDirection {
    if (current.key === key) return current.direction === 'asc' ? 'desc' : 'asc'
    return numeric ? 'desc' : 'asc'
}

export function ManagerRankingsTable({ rankings }: ManagerRankingsTableProps) {
    const [sort, setSort] = useState<SortConfig>({
        key: 'rank',
        direction: 'asc',
    })

    const sortedRankings = useMemo(
        () => [...rankings].sort((a, b) => compareRows(a, b, sort)),
        [rankings, sort]
    )

    function updateSort(column: SortColumn) {
        setSort((current) => ({
            key: column.key,
            direction: nextDirection(current, column.key, column.numeric),
        }))
    }

    return (
        <div className="almanac-table-wrap">
            <table className="almanac-table">
                <thead>
                    <tr>
                        {columns.map((column) => {
                            const isActive = sort.key === column.key
                            return (
                                <th
                                    key={column.key}
                                    aria-sort={
                                        isActive
                                            ? sort.direction === 'asc'
                                                ? 'ascending'
                                                : 'descending'
                                            : 'none'
                                    }
                                >
                                    <button
                                        className="sort-header-button"
                                        type="button"
                                        onClick={() => updateSort(column)}
                                    >
                                        <span>{column.label}</span>
                                        <span
                                            className="sort-indicator"
                                            aria-hidden="true"
                                        >
                                            {isActive
                                                ? sort.direction === 'asc'
                                                    ? '^'
                                                    : 'v'
                                                : '-'}
                                        </span>
                                    </button>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sortedRankings.map((row) => (
                        <tr key={row.managerId}>
                            <td className="rank-cell num" data-label="#">
                                {row.rank}
                            </td>
                            <td
                                className="almanac-row-title"
                                data-label="Manager"
                            >
                                <Link href={`/managers/${row.slug}`}>
                                    {row.name}
                                </Link>
                            </td>
                            <td data-label="Current Team">
                                {row.stats.currentTeamName ?? '-'}
                            </td>
                            <td className="num" data-label="Seasons">
                                {row.stats.seasons}
                            </td>
                            <td className="num" data-label="Record">
                                {formatCareerRecord(row.stats)}
                            </td>
                            <td className="num" data-label="Win %">
                                {formatCareerWinPct(row.stats)}
                            </td>
                            <td className="num" data-label="Avg PR">
                                {row.stats.avgPowerRating?.toFixed(1) ?? '-'}
                            </td>
                            <td className="num" data-label="Titles">
                                {row.stats.championships}
                            </td>
                            <td className="num" data-label="Playoffs">
                                {row.stats.playoffAppearances}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

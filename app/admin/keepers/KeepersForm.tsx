'use client'

import {
    calculateSacrificeRound,
    DEFAULT_WAIVER_ROUND,
    firstRoundPickColumnLabel,
    normalizePlayerName,
    normalizeRoundKept,
    normalizeSeasonDrafted,
    normalizeSeasonsOnRoster,
    resolveRoundKept,
    sacrificeColumnLabel,
} from '@/lib/keepers'
import type { KeepersTrackerRow } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface EditableKeeperRow extends KeepersTrackerRow {}

interface KeepersFormProps {
    rows: KeepersTrackerRow[]
}

function toInputValue(value: string | number | null): string {
    if (value === null) return ''
    return String(value)
}

export default function KeepersForm({ rows }: KeepersFormProps) {
    const router = useRouter()
    const [keeperRows, setKeeperRows] = useState<EditableKeeperRow[]>(rows)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    function updateRow(
        managerId: number,
        changes: Partial<
            Pick<
                EditableKeeperRow,
                | 'playerKept'
                | 'seasonDrafted'
                | 'roundKept'
                | 'seasonsOnRoster'
                | 'firstRoundPick'
            >
        >
    ) {
        setKeeperRows((current) =>
            current.map((row) => {
                if (row.managerId !== managerId) return row

                const next = { ...row, ...changes }
                const playerKept = normalizePlayerName(next.playerKept)

                if (!playerKept) {
                    return {
                        ...next,
                        playerKept: null,
                        seasonDrafted: null,
                        roundKept: null,
                        seasonsOnRoster: null,
                        sacrificeRound: null,
                    }
                }

                const seasonDrafted =
                    changes.seasonDrafted !== undefined
                        ? changes.seasonDrafted
                        : next.seasonDrafted

                let roundKept =
                    changes.roundKept !== undefined
                        ? changes.roundKept
                        : next.roundKept

                if (seasonDrafted === null) {
                    roundKept = DEFAULT_WAIVER_ROUND
                } else if (
                    changes.seasonDrafted !== undefined &&
                    changes.roundKept === undefined &&
                    row.seasonDrafted === null
                ) {
                    roundKept = null
                }

                const resolvedRoundKept = resolveRoundKept(
                    playerKept,
                    seasonDrafted,
                    roundKept
                )

                return {
                    ...next,
                    playerKept,
                    seasonDrafted,
                    roundKept: resolvedRoundKept,
                    sacrificeRound: calculateSacrificeRound({
                        playerKept,
                        roundKept: resolvedRoundKept,
                        seasonsOnRoster: next.seasonsOnRoster,
                        firstRoundPick: next.firstRoundPick,
                    }),
                }
            })
        )
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch('/api/admin/keepers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keepers: keeperRows.map((row) => ({
                        managerId: row.managerId,
                        playerKept: row.playerKept,
                        seasonDrafted: row.seasonDrafted,
                        roundKept: row.roundKept,
                        seasonsOnRoster: row.seasonsOnRoster,
                        firstRoundPick: row.firstRoundPick,
                    })),
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                setError(
                    (data as { error?: string }).error ??
                        'Failed to update keepers'
                )
                return
            }

            setMessage('Keepers updated.')
            router.refresh()
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form keepers-form">
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
                        {keeperRows.map((row) => (
                            <tr key={row.managerId}>
                                <td
                                    className="almanac-row-title"
                                    data-label="Team Owner"
                                >
                                    {row.managerName}
                                </td>
                                <td data-label="Player Kept">
                                    <input
                                        type="text"
                                        className="admin-input keepers-player-input"
                                        value={toInputValue(row.playerKept)}
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                playerKept:
                                                    event.target.value || null,
                                            })
                                        }
                                        placeholder="No keeper"
                                    />
                                </td>
                                <td data-label="Season Drafted">
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={toInputValue(row.seasonDrafted)}
                                        disabled={!row.playerKept}
                                        min={2000}
                                        max={2100}
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                seasonDrafted:
                                                    normalizeSeasonDrafted(
                                                        event.target.value
                                                    ),
                                            })
                                        }
                                        placeholder="Waiver/FA"
                                    />
                                </td>
                                <td data-label="Round Kept">
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={toInputValue(row.roundKept)}
                                        disabled={
                                            !row.playerKept ||
                                            row.seasonDrafted === null
                                        }
                                        min={1}
                                        max={20}
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                roundKept: normalizeRoundKept(
                                                    event.target.value
                                                ),
                                            })
                                        }
                                    />
                                </td>
                                <td data-label={sacrificeColumnLabel()}>
                                    <span
                                        className={`keepers-sacrifice-preview ${
                                            row.sacrificeRound ===
                                            'Not Eligible'
                                                ? 'ineligible'
                                                : ''
                                        }`}
                                    >
                                        {row.sacrificeRound ?? '—'}
                                    </span>
                                </td>
                                <td data-label="Seasons on Roster">
                                    <input
                                        type="number"
                                        className="admin-input"
                                        value={toInputValue(
                                            row.seasonsOnRoster
                                        )}
                                        disabled={!row.playerKept}
                                        min={1}
                                        max={3}
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                seasonsOnRoster:
                                                    normalizeSeasonsOnRoster(
                                                        event.target.value
                                                    ),
                                            })
                                        }
                                    />
                                </td>
                                <td data-label={firstRoundPickColumnLabel()}>
                                    <input
                                        type="text"
                                        className="admin-input keepers-first-round-input"
                                        value={toInputValue(row.firstRoundPick)}
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                firstRoundPick:
                                                    event.target.value || null,
                                            })
                                        }
                                        placeholder="—"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {message && <p className="admin-success">{message}</p>}

            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Saving...' : 'Save Keepers'}
            </button>
        </form>
    )
}

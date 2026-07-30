'use client'

import type { Manager } from '@/lib/db/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface SeasonEntryFormProps {
    managers: Manager[]
}

export default function SeasonEntryForm({ managers }: SeasonEntryFormProps) {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(event.currentTarget)
        const payload = Object.fromEntries(formData.entries())

        try {
            const response = await fetch('/api/admin/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    playoffAppearance: formData.get('playoffAppearance') === 'on',
                    playoffBye: formData.get('playoffBye') === 'on',
                    championshipWon: formData.get('championshipWon') === 'on',
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                setError(
                    (data as { error?: string }).error ??
                        'Failed to save season entry'
                )
                return
            }

            router.push(`/seasons/${payload.year}`)
            router.refresh()
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-grid">
                <label className="admin-field">
                    Year
                    <input name="year" type="number" required className="admin-input" />
                </label>
                <label className="admin-field">
                    Manager
                    <select name="managerId" required className="admin-select">
                        <option value="">Select manager</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="admin-field">
                    Team Name
                    <input name="teamName" type="text" required className="admin-input" />
                </label>
                <label className="admin-field">
                    Finish
                    <input
                        name="finish"
                        type="number"
                        min="1"
                        required
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Power Rating
                    <input
                        name="powerRating"
                        type="number"
                        step="0.01"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Moves
                    <input
                        name="moves"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Regular Season Wins
                    <input
                        name="regularSeasonWins"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Regular Season Losses
                    <input
                        name="regularSeasonLosses"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Regular Season Ties
                    <input
                        name="regularSeasonTies"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Points For
                    <input
                        name="pointsFor"
                        type="number"
                        step="0.01"
                        required
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Points Against
                    <input
                        name="pointsAgainst"
                        type="number"
                        step="0.01"
                        required
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Playoff Wins
                    <input
                        name="playoffWins"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
                <label className="admin-field">
                    Playoff Losses
                    <input
                        name="playoffLosses"
                        type="number"
                        defaultValue="0"
                        className="admin-input"
                    />
                </label>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem',
                    flexWrap: 'wrap',
                }}
            >
                <label>
                    <input name="playoffAppearance" type="checkbox" /> Playoff
                    appearance
                </label>
                <label>
                    <input name="playoffBye" type="checkbox" /> First-round bye
                </label>
                <label>
                    <input name="championshipWon" type="checkbox" /> Championship
                    won
                </label>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Saving…' : 'Save Season Entry'}
            </button>
        </form>
    )
}

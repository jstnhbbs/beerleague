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
            const data = await response.json()
            setError(data.error ?? 'Failed to save season entry')
            setLoading(false)
            return
        }

        const data = await response.json()
        router.push(`/seasons/${payload.year}`)
        router.refresh()
        setLoading(false)
    }

    const fieldStyle = {
        width: '100%',
        padding: '0.65rem 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--almanac-border)',
        background: 'var(--almanac-card)',
        color: 'var(--almanac-ink)',
    }

    return (
        <form onSubmit={handleSubmit} className="almanac-card" style={{ maxWidth: 720 }}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label>
                    Year
                    <input name="year" type="number" required style={fieldStyle} />
                </label>
                <label>
                    Manager
                    <select name="managerId" required style={fieldStyle}>
                        <option value="">Select manager</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Team Name
                    <input name="teamName" type="text" required style={fieldStyle} />
                </label>
                <label>
                    Finish
                    <input name="finish" type="number" min="1" required style={fieldStyle} />
                </label>
                <label>
                    Power Rating
                    <input name="powerRating" type="number" step="0.01" style={fieldStyle} />
                </label>
                <label>
                    Moves
                    <input name="moves" type="number" defaultValue="0" style={fieldStyle} />
                </label>
                <label>
                    Regular Season Wins
                    <input name="regularSeasonWins" type="number" defaultValue="0" style={fieldStyle} />
                </label>
                <label>
                    Regular Season Losses
                    <input name="regularSeasonLosses" type="number" defaultValue="0" style={fieldStyle} />
                </label>
                <label>
                    Regular Season Ties
                    <input name="regularSeasonTies" type="number" defaultValue="0" style={fieldStyle} />
                </label>
                <label>
                    Points For
                    <input name="pointsFor" type="number" step="0.01" required style={fieldStyle} />
                </label>
                <label>
                    Points Against
                    <input name="pointsAgainst" type="number" step="0.01" required style={fieldStyle} />
                </label>
                <label>
                    Playoff Wins
                    <input name="playoffWins" type="number" defaultValue="0" style={fieldStyle} />
                </label>
                <label>
                    Playoff Losses
                    <input name="playoffLosses" type="number" defaultValue="0" style={fieldStyle} />
                </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <label><input name="playoffAppearance" type="checkbox" /> Playoff appearance</label>
                <label><input name="playoffBye" type="checkbox" /> First-round bye</label>
                <label><input name="championshipWon" type="checkbox" /> Championship won</label>
            </div>

            {error && <p style={{ color: '#b45309', marginTop: '1rem' }}>{error}</p>}

            <button
                type="submit"
                disabled={loading}
                style={{
                    marginTop: '1.25rem',
                    background: 'var(--almanac-gold)',
                    color: '#1a1207',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.65rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                {loading ? 'Saving…' : 'Save Season Entry'}
            </button>
        </form>
    )
}

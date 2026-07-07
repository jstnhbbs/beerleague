'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ManagerForm() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(event.currentTarget)
        const response = await fetch('/api/admin/managers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name'),
            }),
        })

        if (!response.ok) {
            const data = await response.json()
            setError(data.error ?? 'Failed to create manager')
            setLoading(false)
            return
        }

        const data = await response.json()
        router.push(`/managers/${data.slug}`)
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="almanac-card" style={{ maxWidth: 420 }}>
            <label htmlFor="name">Manager Name</label>
            <input
                id="name"
                name="name"
                type="text"
                required
                style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    marginTop: '0.5rem',
                    marginBottom: '1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--almanac-border)',
                    background: 'var(--almanac-card)',
                    color: 'var(--almanac-ink)',
                }}
            />
            {error && <p style={{ color: '#b45309', marginBottom: '0.75rem' }}>{error}</p>}
            <button
                type="submit"
                disabled={loading}
                style={{
                    background: 'var(--almanac-gold)',
                    color: '#1a1207',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.65rem 1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                {loading ? 'Saving…' : 'Create Manager'}
            </button>
        </form>
    )
}

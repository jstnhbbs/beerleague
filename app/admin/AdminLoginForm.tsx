'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setLoading(true)
        setError('')

        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        })

        if (!response.ok) {
            const data = await response.json()
            setError(data.error ?? 'Login failed')
            setLoading(false)
            return
        }

        router.refresh()
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="almanac-card" style={{ maxWidth: 420 }}>
            <h2>Admin Login</h2>
            <p style={{ margin: '0.75rem 0 1rem', color: 'var(--almanac-muted)' }}>
                Enter the league admin password to make edits.
            </p>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Password
            </label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    marginBottom: '1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--almanac-border)',
                    background: 'var(--almanac-card)',
                    color: 'var(--almanac-ink)',
                }}
            />
            {error && (
                <p style={{ color: '#b45309', marginBottom: '0.75rem' }}>{error}</p>
            )}
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
                {loading ? 'Signing in…' : 'Sign In'}
            </button>
        </form>
    )
}

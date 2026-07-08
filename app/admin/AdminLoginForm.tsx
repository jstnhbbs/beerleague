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
        <form onSubmit={handleSubmit} className="admin-form">
            <h2>Admin Login</h2>
            <p style={{ margin: '0.75rem 0 1rem', color: 'var(--foreground-muted)' }}>
                Enter the league admin password to make edits.
            </p>
            <label htmlFor="password" className="admin-field">
                Password
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="admin-input"
                />
            </label>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Signing in…' : 'Sign In'}
            </button>
        </form>
    )
}

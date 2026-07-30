'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginForm() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                setError(
                    (data as { error?: string }).error ?? 'Login failed'
                )
                return
            }

            router.refresh()
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h2>Admin Login</h2>
            <p style={{ margin: '0.75rem 0 1rem', color: 'var(--foreground-muted)' }}>
                Sign in with your commissioner username and password.
            </p>
            <label htmlFor="username" className="admin-field">
                Username
                <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="admin-input"
                />
            </label>
            <label htmlFor="password" className="admin-field">
                Password
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
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

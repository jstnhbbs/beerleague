'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ChangePasswordForm() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                setError(
                    (data as { error?: string }).error ??
                        'Failed to update password'
                )
                return
            }

            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setMessage('Password updated.')
            router.refresh()
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <label htmlFor="currentPassword" className="admin-field">
                Current Password
                <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) =>
                        setCurrentPassword(event.target.value)
                    }
                    className="admin-input"
                />
            </label>
            <label htmlFor="newPassword" className="admin-field">
                New Password
                <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="admin-input"
                />
            </label>
            <label htmlFor="confirmPassword" className="admin-field">
                Confirm New Password
                <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                    className="admin-input"
                />
            </label>
            {error && <p className="admin-error">{error}</p>}
            {message && <p className="admin-success">{message}</p>}
            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Saving...' : 'Update Password'}
            </button>
        </form>
    )
}

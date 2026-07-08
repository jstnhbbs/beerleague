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
        <form onSubmit={handleSubmit} className="admin-form">
            <label htmlFor="name" className="admin-field">
                Manager Name
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="admin-input"
                />
            </label>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Saving…' : 'Create Manager'}
            </button>
        </form>
    )
}

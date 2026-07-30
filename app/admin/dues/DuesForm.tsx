'use client'

import { PAYMENT_METHODS } from '@/lib/dues'
import type { DuesTrackerRow } from '@/lib/queries'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface EditableDuesRow extends DuesTrackerRow {
    paymentMethod: string | null
}

interface DuesFormProps {
    rows: DuesTrackerRow[]
}

export default function DuesForm({ rows }: DuesFormProps) {
    const router = useRouter()
    const [duesRows, setDuesRows] = useState<EditableDuesRow[]>(rows)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    function updateRow(
        managerId: number,
        changes: Partial<Pick<EditableDuesRow, 'paid' | 'paymentMethod'>>
    ) {
        setDuesRows((current) =>
            current.map((row) =>
                row.managerId === managerId
                    ? {
                          ...row,
                          ...changes,
                          paymentMethod:
                              changes.paid === false
                                  ? null
                                  : changes.paymentMethod ?? row.paymentMethod,
                      }
                    : row
            )
        )
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch('/api/admin/dues', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dues: duesRows.map((row) => ({
                        managerId: row.managerId,
                        paid: row.paid,
                        paymentMethod: row.paid ? row.paymentMethod : null,
                    })),
                }),
            })

            if (!response.ok) {
                const data = await response.json().catch(() => ({}))
                setError(
                    (data as { error?: string }).error ??
                        'Failed to update dues'
                )
                return
            }

            setMessage('Dues tracker updated.')
            router.refresh()
        } catch {
            setError('Network error. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="admin-form dues-form">
            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>Manager</th>
                            <th>Team</th>
                            <th>Paid</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {duesRows.map((row) => (
                            <tr key={row.managerId}>
                                <td
                                    className="almanac-row-title"
                                    data-label="Manager"
                                >
                                    {row.managerName}
                                </td>
                                <td data-label="Team">{row.teamName}</td>
                                <td data-label="Paid">
                                    <label className="admin-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={row.paid}
                                            onChange={(event) =>
                                                updateRow(row.managerId, {
                                                    paid: event.target.checked,
                                                })
                                            }
                                        />
                                        {row.paid ? 'Paid' : 'Unpaid'}
                                    </label>
                                </td>
                                <td data-label="Method">
                                    <select
                                        value={row.paymentMethod ?? ''}
                                        disabled={!row.paid}
                                        className="admin-select dues-method-select"
                                        onChange={(event) =>
                                            updateRow(row.managerId, {
                                                paymentMethod:
                                                    event.target.value || null,
                                            })
                                        }
                                    >
                                        <option value="">Select method</option>
                                        {PAYMENT_METHODS.map((method) => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {error && <p className="admin-error">{error}</p>}
            {message && <p className="admin-success">{message}</p>}

            <button type="submit" disabled={loading} className="admin-button">
                {loading ? 'Saving...' : 'Save Dues'}
            </button>
        </form>
    )
}

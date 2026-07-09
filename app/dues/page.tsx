import Link from 'next/link'
import { getDuesTracker } from '@/lib/queries'
import '../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function DuesPage() {
    const tracker = await getDuesTracker()
    const paidCount = tracker.rows.filter((row) => row.paid).length

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">League Business</p>
                <h1 className="almanac-title">Dues Tracker</h1>
                <p className="almanac-subtitle">
                    {tracker.seasonYear
                        ? `${paidCount} of ${tracker.rows.length} active managers have paid for ${tracker.seasonYear}.`
                        : 'No active season is available yet.'}
                </p>
            </header>

            <div className="almanac-table-wrap">
                <table className="almanac-table">
                    <thead>
                        <tr>
                            <th>Manager</th>
                            <th>Team</th>
                            <th>Status</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracker.rows.map((row) => (
                            <tr key={row.managerId}>
                                <td
                                    className="almanac-row-title"
                                    data-label="Manager"
                                >
                                    <Link href={`/managers/${row.managerSlug}`}>
                                        {row.managerName}
                                    </Link>
                                </td>
                                <td data-label="Team">{row.teamName}</td>
                                <td data-label="Status">
                                    <span
                                        className={
                                            row.paid
                                                ? 'dues-status paid'
                                                : 'dues-status unpaid'
                                        }
                                    >
                                        {row.paid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </td>
                                <td data-label="Method">
                                    {row.paymentMethod ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

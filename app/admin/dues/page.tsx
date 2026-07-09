import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { getDuesTracker } from '@/lib/queries'
import DuesForm from './DuesForm'
import '../../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function AdminDuesPage() {
    if (!(await isAdmin())) redirect('/admin')

    const tracker = await getDuesTracker()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin</p>
                <h1 className="almanac-title">Edit Dues Tracker</h1>
                <p className="almanac-subtitle">
                    {tracker.seasonYear
                        ? `Update payment status for active ${tracker.seasonYear} managers.`
                        : 'No active season is available yet.'}
                </p>
            </header>

            <DuesForm rows={tracker.rows} />
        </div>
    )
}

import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { keeperSeasonLabel } from '@/lib/keepers'
import { getKeepersTracker } from '@/lib/queries'
import KeepersForm from './KeepersForm'
import '../../almanac.css'
import '../../keepers/keepers.css'

export { dynamic } from '@/lib/db/route-config'

export default async function AdminKeepersPage() {
    if (!(await isAdmin())) redirect('/admin')

    const tracker = await getKeepersTracker()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin</p>
                <h1 className="almanac-title">
                    Edit Keepers {keeperSeasonLabel()}
                </h1>
                <p className="almanac-subtitle">
                    {tracker.rows.length > 0
                        ? `Update keeper declarations for the ${tracker.keeperDraftYear} draft. Sacrifice round is calculated automatically.`
                        : 'No active season is available yet.'}
                </p>
            </header>

            <KeepersForm rows={tracker.rows} />
        </div>
    )
}

import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { getAllManagers } from '@/lib/queries'
import SeasonEntryForm from './SeasonEntryForm'
import '../../../almanac.css'

export default async function NewSeasonEntryPage() {
    if (!(await isAdmin())) redirect('/admin')

    const managersList = await getAllManagers()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin</p>
                <h1 className="almanac-title">Add Season Entry</h1>
            </header>
            <SeasonEntryForm managers={managersList} />
        </div>
    )
}

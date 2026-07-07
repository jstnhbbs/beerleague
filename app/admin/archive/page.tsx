import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import { archiveTeams } from '@/lib/archive-teams'
import '../../almanac.css'

export default async function AdminArchivePage() {
    if (!(await isAdmin())) redirect('/admin')

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin · Legacy Views</p>
                <h1 className="almanac-title">Stats Archive</h1>
                <p className="almanac-subtitle">
                    The original Google Sheets team stat pages, preserved while
                    the new almanac is built out.
                </p>
            </header>

            <p className="archive-note">
                These pages embed the live Google Sheets from the previous site.
                Public league history lives in Managers, Seasons, and
                Championships.
            </p>

            <div className="almanac-grid">
                {archiveTeams.map((team) => (
                    <Link
                        key={team.id}
                        href={`/admin/archive/teams/${team.id}`}
                        className="almanac-card"
                    >
                        <h2>{team.name}</h2>
                        <p>Open legacy Google Sheets stats →</p>
                    </Link>
                ))}
            </div>

            <p style={{ marginTop: '1.5rem' }}>
                <Link href="/admin">← Back to admin dashboard</Link>
            </p>
        </div>
    )
}

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import {
    archiveTeams,
    getArchiveTeamName,
    getArchiveTeamSheetUrl,
} from '@/lib/archive-teams'
import './team.css'

interface TeamPageProps {
    params: {
        teamId: string
    }
}

export async function generateStaticParams() {
    return archiveTeams.map((team) => ({ teamId: team.id }))
}

export default async function AdminArchiveTeamPage({ params }: TeamPageProps) {
    if (!(await isAdmin())) redirect('/admin')

    const { teamId } = params
    const sheetUrl = getArchiveTeamSheetUrl(teamId)
    const teamName = getArchiveTeamName(teamId)

    if (!sheetUrl || !teamName) {
        notFound()
    }

    return (
        <div className="container">
            <div className="team-header">
                <p className="almanac-eyebrow">Admin · Legacy Archive</p>
                <h1 className="team-title">{teamName} Statistics</h1>
            </div>

            <div className="sheet-container">
                <iframe
                    src={sheetUrl}
                    className="stats-sheet"
                    title={`${teamName} Statistics`}
                />
            </div>

            <p style={{ marginTop: '1.5rem' }}>
                <Link href="/admin/archive">← Back to stats archive</Link>
            </p>
        </div>
    )
}

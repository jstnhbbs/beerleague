import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession, isAdmin } from '@/lib/auth'
import ChangePasswordForm from './ChangePasswordForm'
import '../../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function ChangePasswordPage() {
    if (!(await isAdmin())) redirect('/admin')

    const session = await getAdminSession()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin</p>
                <h1 className="almanac-title">Change Password</h1>
                <p className="almanac-subtitle">
                    {session
                        ? `Update the password for ${session.displayName}.`
                        : 'Update your admin password.'}
                </p>
            </header>

            <ChangePasswordForm />

            <p style={{ marginTop: '1.5rem' }}>
                <Link href="/admin" className="text-link">
                    ← Back to admin dashboard
                </Link>
            </p>
        </div>
    )
}

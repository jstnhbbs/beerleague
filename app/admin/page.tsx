import Link from 'next/link'
import { isAdmin } from '@/lib/auth'
import '../almanac.css'
import AdminLoginForm from './AdminLoginForm'

export default async function AdminPage() {
    const authed = await isAdmin()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Restricted</p>
                <h1 className="almanac-title">League Admin</h1>
                <p className="almanac-subtitle">
                    Add seasons and update league history. Public visitors can
                    browse everything else without logging in.
                </p>
            </header>

            {authed ? (
                <div className="almanac-grid">
                    <Link href="/admin/seasons/new" className="almanac-card">
                        <h2>Add Season Entry</h2>
                        <p>
                            Record a manager&apos;s results for a new or
                            existing season.
                        </p>
                    </Link>
                    <Link href="/admin/managers/new" className="almanac-card">
                        <h2>Add Manager</h2>
                        <p>Register a new manager to the league history.</p>
                    </Link>
                    <form action="/api/admin/logout" method="post">
                        <button type="submit" className="almanac-card">
                            <h2>Log Out</h2>
                            <p>End the admin session on this browser.</p>
                        </button>
                    </form>
                </div>
            ) : (
                <AdminLoginForm />
            )}
        </div>
    )
}

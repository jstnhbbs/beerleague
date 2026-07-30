import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import AdminLoginForm from './AdminLoginForm'
import '../almanac.css'

export { dynamic } from '@/lib/db/route-config'

export default async function AdminPage() {
    const session = await getAdminSession()

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Restricted</p>
                <h1 className="almanac-title">League Admin</h1>
                <p className="almanac-subtitle">
                    {session
                        ? `Signed in as ${session.displayName}. Manage league data from the tools below.`
                        : 'Sign in to manage league data. Public visitors can browse everything else without logging in.'}
                </p>
            </header>

            {session ? (
                <>
                    <div className="admin-hub-actions">
                        <Link
                            href="/admin/change-password"
                            className="text-link"
                        >
                            Change password
                        </Link>
                        <form action="/api/admin/logout" method="post">
                            <button type="submit" className="admin-link-button">
                                Log out
                            </button>
                        </form>
                    </div>

                    <section className="admin-hub-section">
                        <h2 className="almanac-section-title">Season Data</h2>
                        <div className="almanac-grid">
                            <Link
                                href="/admin/seasons/new"
                                className="almanac-card"
                            >
                                <h2>Add Season Entry</h2>
                                <p>
                                    Record a manager&apos;s results for a new
                                    or existing season.
                                </p>
                            </Link>
                            <Link
                                href="/admin/managers/new"
                                className="almanac-card"
                            >
                                <h2>Add Manager</h2>
                                <p>
                                    Register a new manager to the league
                                    history.
                                </p>
                            </Link>
                        </div>
                    </section>

                    <section className="admin-hub-section">
                        <h2 className="almanac-section-title">League Business</h2>
                        <div className="almanac-grid">
                            <Link href="/admin/dues" className="almanac-card">
                                <h2>Edit Dues Tracker</h2>
                                <p>
                                    Mark active managers as paid and record
                                    their payment method.
                                </p>
                            </Link>
                            <Link href="/admin/keepers" className="almanac-card">
                                <h2>Edit Keepers</h2>
                                <p>
                                    Update keeper declarations, draft rounds,
                                    and first-round pick references.
                                </p>
                            </Link>
                        </div>
                    </section>

                    <section className="admin-hub-section">
                        <h2 className="almanac-section-title">Archive</h2>
                        <div className="almanac-grid">
                            <Link href="/admin/archive" className="almanac-card">
                                <h2>Stats Archive</h2>
                                <p>
                                    Legacy Google Sheets team views from the
                                    previous site.
                                </p>
                            </Link>
                        </div>
                    </section>
                </>
            ) : (
                <AdminLoginForm />
            )}
        </div>
    )
}

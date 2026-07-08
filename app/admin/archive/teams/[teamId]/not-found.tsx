import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="container">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Team Not Found
                </h1>
                <p
                    style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                    }}
                >
                    The team you&apos;re looking for doesn&apos;t exist.
                </p>
                <Link href="/admin/archive" className="text-link">
                    Back to Archive
                </Link>
            </div>
        </div>
    )
}

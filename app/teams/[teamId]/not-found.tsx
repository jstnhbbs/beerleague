import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="container">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Team Not Found</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    The team you're looking for doesn't exist.
                </p>
                <Link
                    href="/"
                    style={{
                        display: 'inline-block',
                        padding: '0.75rem 2rem',
                        background: 'var(--primary-color)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '500',
                        transition: 'background 0.2s'
                    }}
                >
                    Go Back Home
                </Link>
            </div>
        </div>
    )
}

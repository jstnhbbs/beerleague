import Link from 'next/link'
import './Navigation.css'

export default function Navigation() {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    Beer League
                </Link>
                <div className="nav-links">
                    <Link href="/" className="nav-link">
                        Home
                    </Link>
                    <Link href="/rules" className="nav-link">
                        Rules
                    </Link>
                </div>
            </div>
        </nav>
    )
}

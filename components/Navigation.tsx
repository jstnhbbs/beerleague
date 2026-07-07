import Link from 'next/link'
import './Navigation.css'
import DarkModeToggle from './DarkModeToggle'

export default function Navigation() {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link href="/" className="nav-logo">
                    Beer League Almanac
                </Link>
                <div className="nav-links">
                    <Link href="/managers" className="nav-link">
                        Managers
                    </Link>
                    <Link href="/seasons" className="nav-link">
                        Seasons
                    </Link>
                    <Link href="/championships" className="nav-link">
                        Championships
                    </Link>
                    <Link href="/archive" className="nav-link">
                        Archive
                    </Link>
                    <Link href="/rules" className="nav-link">
                        Rules
                    </Link>
                    <DarkModeToggle />
                </div>
            </div>
        </nav>
    )
}

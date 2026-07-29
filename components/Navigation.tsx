'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './Navigation.css'
import ThemeToggle from './ThemeToggle'

const navItems = [
    { href: '/managers', label: 'Managers' },
    { href: '/seasons', label: 'Seasons' },
    { href: '/championships', label: 'Championships' },
    { href: '/dues', label: 'Dues' },
    { href: '/keepers', label: 'Keepers' },
    { href: '/rules', label: 'Rules' },
]

function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navigation() {
    const pathname = usePathname()

    return (
        <header>
            <nav className="navbar">
                <div className="nav-container">
                    <Link
                        href="/"
                        className={`nav-logo ${pathname === '/' ? 'active' : ''}`}
                    >
                        Beer League Almanac
                    </Link>
                    <div className="nav-links">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${
                                    isActive(pathname, item.href) ? 'active' : ''
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    )
}

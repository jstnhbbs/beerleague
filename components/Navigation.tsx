'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AdminSession } from '@/lib/auth'
import './Navigation.css'
import ThemeToggle from './ThemeToggle'

const navItems = [
    { href: '/managers', label: 'Managers' },
    { href: '/seasons', label: 'Seasons' },
    { href: '/championships', label: 'Championships' },
    { href: '/dues', label: 'Dues' },
    { href: '/keepers', label: 'Keepers' },
    { href: '/rules', label: 'Rules' },
    { href: '/admin', label: 'Admin' },
]

function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
}

interface NavigationProps {
    adminSession: AdminSession | null
}

export default function Navigation({ adminSession }: NavigationProps) {
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
                        {adminSession && (
                            <span className="nav-admin-badge">
                                {adminSession.displayName}
                            </span>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    )
}

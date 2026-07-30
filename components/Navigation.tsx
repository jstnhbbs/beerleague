'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
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
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        setMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [menuOpen])

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

                    <div className="nav-actions">
                        {adminSession && (
                            <span className="nav-admin-badge nav-admin-badge-desktop">
                                {adminSession.displayName}
                            </span>
                        )}
                        <ThemeToggle />
                        <button
                            type="button"
                            className="nav-menu-toggle"
                            aria-expanded={menuOpen}
                            aria-controls="primary-navigation"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <span className="nav-menu-bar" />
                            <span className="nav-menu-bar" />
                            <span className="nav-menu-bar" />
                        </button>
                    </div>

                    <div
                        id="primary-navigation"
                        className={`nav-links ${menuOpen ? 'open' : ''}`}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${
                                    isActive(pathname, item.href) ? 'active' : ''
                                }`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {adminSession && (
                            <span className="nav-admin-badge nav-admin-badge-mobile">
                                {adminSession.displayName}
                            </span>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

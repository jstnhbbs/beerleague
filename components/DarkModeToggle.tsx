'use client'

import { useEffect, useState } from 'react'
import './DarkModeToggle.css'

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check localStorage and system preference
        const stored = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const shouldBeDark = stored === 'dark' || (!stored && prefersDark)

        setIsDark(shouldBeDark)
        updateTheme(shouldBeDark)
    }, [])

    const updateTheme = (dark: boolean) => {
        const root = document.documentElement
        if (dark) {
            root.classList.add('dark')
            root.classList.remove('light')
        } else {
            root.classList.remove('dark')
            root.classList.add('light')
        }
    }

    const toggleDarkMode = () => {
        const newIsDark = !isDark
        setIsDark(newIsDark)
        updateTheme(newIsDark)
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    }

    if (!mounted) {
        return (
            <button
                className="dark-mode-toggle"
                aria-label="Toggle dark mode"
            >
                🌙
            </button>
        )
    }

    return (
        <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    )
}

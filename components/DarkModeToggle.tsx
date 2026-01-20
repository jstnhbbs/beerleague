'use client'

import { useEffect, useState } from 'react'
import './DarkModeToggle.css'

export default function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Check localStorage and system preference
        const stored = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const shouldBeDark = stored === 'dark' || (!stored && prefersDark)

        setIsDark(shouldBeDark)
        updateTheme(shouldBeDark)
    }, [])

    const toggleDarkMode = () => {
        const newIsDark = !isDark
        setIsDark(newIsDark)
        updateTheme(newIsDark)
        localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
    }

    const updateTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
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

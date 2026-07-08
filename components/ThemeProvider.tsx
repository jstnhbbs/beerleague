'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): Theme {
    if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    }
    return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)
    const [userPreference, setUserPreference] = useState<Theme | null>(null)

    useEffect(() => {
        setMounted(true)

        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme | null

            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                setUserPreference(savedTheme)
                setTheme(savedTheme)
                document.documentElement.setAttribute('data-theme', savedTheme)
            } else {
                const systemTheme = getSystemTheme()
                setTheme(systemTheme)
                document.documentElement.setAttribute('data-theme', systemTheme)
            }
        }
    }, [])

    useEffect(() => {
        if (!mounted || userPreference !== null) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            const systemTheme = e.matches ? 'dark' : 'light'
            setTheme(systemTheme)
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }

        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
    }, [mounted, userPreference])

    useEffect(() => {
        if (mounted && typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme)
            if (userPreference !== null) {
                localStorage.setItem('theme', theme)
            }
        }
    }, [theme, mounted, userPreference])

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === 'light' ? 'dark' : 'light'
            setUserPreference(newTheme)
            localStorage.setItem('theme', newTheme)
            return newTheme
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

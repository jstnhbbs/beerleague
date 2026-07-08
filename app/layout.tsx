import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { ThemeProvider } from '@/components/ThemeProvider'

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    preload: false,
    adjustFontFallback: true,
})

export const metadata: Metadata = {
    title: 'Beer League Almanac',
    description: 'Interactive fantasy football league history for Beer League',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={roboto.className} suppressHydrationWarning>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var stored = localStorage.getItem('theme');
                                    if (stored === 'light' || stored === 'dark') {
                                        document.documentElement.setAttribute('data-theme', stored);
                                    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                        document.documentElement.setAttribute('data-theme', 'dark');
                                    } else {
                                        document.documentElement.setAttribute('data-theme', 'light');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <ThemeProvider>
                    <Navigation />
                    <main>{children}</main>
                </ThemeProvider>
            </body>
        </html>
    )
}

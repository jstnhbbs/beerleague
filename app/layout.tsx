import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Beer League Stats',
    description: 'Beer League Statistics and Team Information',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const stored = localStorage.getItem('theme');
                                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
                                    if (shouldBeDark) {
                                        document.documentElement.classList.add('dark');
                                        document.documentElement.classList.remove('light');
                                    } else {
                                        document.documentElement.classList.add('light');
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
                <Navigation />
                <main>{children}</main>
            </body>
        </html>
    )
}

'use client'

import { useEffect, useState } from 'react'

interface RulesSidebarLink {
    href: string
    label: string
}

interface RulesSidebarProps {
    links: readonly RulesSidebarLink[]
}

export default function RulesSidebar({ links }: RulesSidebarProps) {
    const firstSection = links[0]?.href.slice(1) ?? ''
    const [activeSection, setActiveSection] = useState(firstSection)

    useEffect(() => {
        const sectionIds = links.map((link) => link.href.slice(1))

        function updateActiveSection() {
            let currentSectionId = firstSection

            for (const id of sectionIds) {
                const section = document.getElementById(id)
                if (section && section.getBoundingClientRect().top <= 140) {
                    currentSectionId = id
                }
            }

            setActiveSection(currentSectionId)
        }

        updateActiveSection()
        window.addEventListener('scroll', updateActiveSection, { passive: true })
        window.addEventListener('resize', updateActiveSection)

        return () => {
            window.removeEventListener('scroll', updateActiveSection)
            window.removeEventListener('resize', updateActiveSection)
        }
    }, [firstSection, links])

    return (
        <nav className="rules-sidebar" aria-label="Rules sections">
            <div className="rules-sidebar-title">Contents</div>
            {links.map((link) => {
                const sectionId = link.href.slice(1)
                return (
                    <a
                        key={link.href}
                        href={link.href}
                        aria-current={
                            activeSection === sectionId ? 'true' : undefined
                        }
                        onClick={() => setActiveSection(sectionId)}
                    >
                        {link.label}
                    </a>
                )
            })}
        </nav>
    )
}

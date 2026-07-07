export function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

export function winPct(wins: number, losses: number, ties = 0): number {
    const games = wins + losses + ties
    if (games === 0) return 0
    return (wins + ties * 0.5) / games
}

export function formatWinPct(wins: number, losses: number, ties = 0): string {
    return winPct(wins, losses, ties).toFixed(3).replace(/^0/, '')
}

export function formatRecord(
    wins: number,
    losses: number,
    ties = 0
): string {
    if (ties > 0) return `${wins}-${losses}-${ties}`
    return `${wins}-${losses}`
}

export function parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
}

export function parseBool(value: unknown): boolean {
    if (value === true || value === 1) return true
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        return normalized === '1' || normalized === 'true' || normalized === 'yes'
    }
    const num = parseNumber(value)
    return num !== null && num > 0
}

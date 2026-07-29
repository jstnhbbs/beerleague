export const CURRENT_KEEPER_DRAFT_YEAR = 2026
export const FIRST_ROUND_PICK_YEAR = 2025
export const DEFAULT_WAIVER_ROUND = 10
export const MAX_SEASONS_ON_ROSTER = 3

export const KEEPER_RULES = [
    'Can only keep one DRAFTED player.',
    "You don't HAVE to have a keeper.",
    'Player must be on roster at end of the year.',
    "Can't keep 1st round drafted players.",
    'You lose a round prior in next draft. (If you keep a player drafted 9th round, you lose your 8th round pick the following year.)',
    'Can only keep the player 2 additional years. Draft, then can keep them, so 3 years total.',
    "If you trade for someone, you can keep that person (as long as they weren't drafted in 1st round) and inherit their draft position.",
    'Keepers selected as waiver, wire or free agent pick ups start at a 10th round pick.',
] as const

export function keeperSeasonLabel(): string {
    const prior = String(FIRST_ROUND_PICK_YEAR).slice(-2)
    const draft = String(CURRENT_KEEPER_DRAFT_YEAR).slice(-2)
    return `${prior}.${draft}`
}

export function sacrificeColumnLabel(): string {
    return `${CURRENT_KEEPER_DRAFT_YEAR} Draft Position to Sacrifice`
}

export function firstRoundPickColumnLabel(): string {
    return `${FIRST_ROUND_PICK_YEAR} First Round Pick`
}

export function normalizePlayerName(value: unknown): string {
    return String(value ?? '').trim()
}

export function playersMatch(
    a: string | null | undefined,
    b: string | null | undefined
): boolean {
    const left = normalizePlayerName(a).toLowerCase()
    const right = normalizePlayerName(b).toLowerCase()
    if (!left || !right) return false
    return left === right
}

export interface KeeperSacrificeInput {
    playerKept: string | null
    roundKept: number | null
    seasonsOnRoster: number | null
    firstRoundPick: string | null
}

export function calculateSacrificeRound(
    input: KeeperSacrificeInput
): string | null {
    const playerKept = normalizePlayerName(input.playerKept)
    if (!playerKept) return null

    const { roundKept, seasonsOnRoster } = input
    if (roundKept === null || seasonsOnRoster === null) return null

    if (roundKept === 1) return 'Not Eligible'
    if (playersMatch(playerKept, input.firstRoundPick)) return 'Not Eligible'
    if (seasonsOnRoster > MAX_SEASONS_ON_ROSTER) return 'Not Eligible'

    const keeperYears = seasonsOnRoster - 1
    const sacrificeRound = roundKept - keeperYears

    if (sacrificeRound < 1) return 'Not Eligible'

    return String(sacrificeRound)
}

export function displayKeeperValue(value: string | number | null): string {
    if (value === null || value === '') return '—'
    return String(value)
}

export function resolveRoundKept(
    playerKept: string | null,
    seasonDrafted: number | null,
    roundKept: number | null
): number | null {
    if (!normalizePlayerName(playerKept)) return null
    if (seasonDrafted === null) return DEFAULT_WAIVER_ROUND
    return roundKept
}

export function normalizeSeasonDrafted(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const year = Number(value)
    if (!Number.isInteger(year) || year < 2000 || year > 2100) return null
    return year
}

export function normalizeRoundKept(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const round = Number(value)
    if (!Number.isInteger(round) || round < 1 || round > 20) return null
    return round
}

export function normalizeSeasonsOnRoster(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const seasons = Number(value)
    if (!Number.isInteger(seasons) || seasons < 1 || seasons > MAX_SEASONS_ON_ROSTER) {
        return null
    }
    return seasons
}

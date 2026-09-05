export const CURRENT_KEEPER_DRAFT_YEAR = 2026
export const FIRST_ROUND_PICK_YEAR = 2025
export const DEFAULT_WAIVER_ROUND = 10
export const MAX_SEASONS_ON_ROSTER = 3

export const KEEPER_RULES = [
    "You don’t HAVE to have a keeper.",
    'Each manager may keep one player from their final roster from the previous season.',
    'A player must be on your roster at the end of the fantasy season to be eligible as your keeper. The end of the season is defined as the end of the final playoff matchup.',
    'You cannot keep 1st round drafted players.',
    'If a drafted player stays on your roster or is acquired by trade, their first keeper cost is one round earlier than their draft round. Each additional season they are kept costs one round earlier than the previous keeper cost. Example: a player drafted in Round 9 costs an 8th round pick the first keeper year, then a 7th round pick the next keeper year.',
    'Any player added by you through waivers or free agency counts as a 10th round keeper in the next draft, regardless of prior draft, keeper, or roster history with another team.',
    'A manager may not drop and re-add a player, or otherwise use waivers/free agency, for the purpose of resetting or improving that player’s keeper cost. If the commissioner determines the move was made to avoid the normal keeper cost, the player keeps their original/inherited keeper cost or may be ruled ineligible as a keeper.',
    'If you trade for a player, you inherit that player’s draft position and keeper eligibility, as long as they were not drafted in the 1st round.',
    'A player can only be kept for 2 additional years after you acquire them, for 3 total seasons on your roster.',
    'If keeper eligibility, acquisition method, or draft value is unclear, the commissioner will use league draft results and transaction history as the source of truth.',
    'Commissioner may deny keeper resets judged to be intentional circumvention.',
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
    if (isMaxKeeperTenure(seasonsOnRoster)) return 'Not Eligible'

    const keeperYears = seasonsOnRoster - 1
    const sacrificeRound = roundKept - keeperYears

    if (sacrificeRound < 1) return 'Not Eligible'

    return String(sacrificeRound)
}

export function isMaxKeeperTenure(
    seasonsOnRoster: number | null | undefined
): boolean {
    return (
        seasonsOnRoster !== null &&
        seasonsOnRoster !== undefined &&
        seasonsOnRoster >= MAX_SEASONS_ON_ROSTER
    )
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

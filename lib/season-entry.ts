export function normalizeSeasonFlags(flags: {
    playoffAppearance: boolean
    championshipWon: boolean
}): { playoffAppearance: boolean; championshipWon: boolean } {
    const championshipWon = flags.championshipWon
    return {
        championshipWon,
        playoffAppearance: flags.playoffAppearance || championshipWon,
    }
}

export function optionalNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
}

export function requireInteger(
    value: unknown,
    fieldName: string,
    options: { min?: number; max?: number } = {}
): number | string {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`
    }

    const num = Number(value)
    if (!Number.isInteger(num)) {
        return `${fieldName} must be a whole number`
    }

    if (options.min !== undefined && num < options.min) {
        return `${fieldName} must be at least ${options.min}`
    }

    if (options.max !== undefined && num > options.max) {
        return `${fieldName} must be at most ${options.max}`
    }

    return num
}

export function optionalInteger(
    value: unknown,
    fieldName: string,
    options: { min?: number; max?: number } = {}
): number | null | string {
    if (value === null || value === undefined || value === '') return null

    const num = Number(value)
    if (!Number.isInteger(num)) {
        return `${fieldName} must be a whole number`
    }

    if (options.min !== undefined && num < options.min) {
        return `${fieldName} must be at least ${options.min}`
    }

    if (options.max !== undefined && num > options.max) {
        return `${fieldName} must be at most ${options.max}`
    }

    return num
}

export function optionalNonNegativeNumber(
    value: unknown,
    fieldName: string
): number | null | string {
    if (value === null || value === undefined || value === '') return null

    const num = Number(value)
    if (!Number.isFinite(num)) {
        return `${fieldName} must be a number`
    }

    if (num < 0) {
        return `${fieldName} cannot be negative`
    }

    return num
}

export function requireNonNegativeNumber(
    value: unknown,
    fieldName: string
): number | string {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`
    }

    const num = Number(value)
    if (!Number.isFinite(num)) {
        return `${fieldName} must be a number`
    }

    if (num < 0) {
        return `${fieldName} cannot be negative`
    }

    return num
}

export interface ParsedSeasonEntryInput {
    year: number
    managerId: number
    finish: number
    teamName: string
    regularSeasonWins: number
    regularSeasonLosses: number
    regularSeasonTies: number
    playoffWins: number
    playoffLosses: number
    moves: number
    pointsFor: number
    pointsAgainst: number
    powerRating: number | null
    pointsForGameHigh: number | null
    pointsForGameLow: number | null
    playoffAppearance: boolean
    playoffBye: boolean
    championshipWon: boolean
}

export function parseSeasonEntryInput(
    body: Record<string, unknown>
): ParsedSeasonEntryInput | string {
    const year = requireInteger(body.year, 'Year', { min: 2000, max: 2100 })
    if (typeof year === 'string') return year

    const managerId = requireInteger(body.managerId, 'Manager', { min: 1 })
    if (typeof managerId === 'string') return managerId

    const finish = requireInteger(body.finish, 'Finish', { min: 1, max: 32 })
    if (typeof finish === 'string') return finish

    const teamName = String(body.teamName ?? '').trim()
    if (!teamName) {
        return 'Team name is required'
    }

    const regularSeasonWins = requireInteger(body.regularSeasonWins, 'Regular season wins', {
        min: 0,
        max: 20,
    })
    if (typeof regularSeasonWins === 'string') return regularSeasonWins

    const regularSeasonLosses = requireInteger(
        body.regularSeasonLosses,
        'Regular season losses',
        { min: 0, max: 20 }
    )
    if (typeof regularSeasonLosses === 'string') return regularSeasonLosses

    const regularSeasonTies = requireInteger(body.regularSeasonTies, 'Regular season ties', {
        min: 0,
        max: 20,
    })
    if (typeof regularSeasonTies === 'string') return regularSeasonTies

    const playoffWins = optionalInteger(body.playoffWins, 'Playoff wins', {
        min: 0,
        max: 10,
    })
    if (typeof playoffWins === 'string') return playoffWins

    const playoffLosses = optionalInteger(body.playoffLosses, 'Playoff losses', {
        min: 0,
        max: 10,
    })
    if (typeof playoffLosses === 'string') return playoffLosses

    const moves = optionalInteger(body.moves, 'Moves', { min: 0, max: 1000 })
    if (typeof moves === 'string') return moves

    const pointsFor = requireNonNegativeNumber(body.pointsFor, 'Points for')
    if (typeof pointsFor === 'string') return pointsFor

    const pointsAgainst = requireNonNegativeNumber(body.pointsAgainst, 'Points against')
    if (typeof pointsAgainst === 'string') return pointsAgainst

    const powerRating = optionalNonNegativeNumber(body.powerRating, 'Power rating')
    if (typeof powerRating === 'string') return powerRating

    const pointsForGameHigh = optionalNonNegativeNumber(
        body.pointsForGameHigh,
        'Points for game high'
    )
    if (typeof pointsForGameHigh === 'string') return pointsForGameHigh

    const pointsForGameLow = optionalNonNegativeNumber(
        body.pointsForGameLow,
        'Points for game low'
    )
    if (typeof pointsForGameLow === 'string') return pointsForGameLow

    const { championshipWon, playoffAppearance } = normalizeSeasonFlags({
        playoffAppearance: Boolean(body.playoffAppearance),
        championshipWon: Boolean(body.championshipWon),
    })

    return {
        year,
        managerId,
        finish,
        teamName,
        regularSeasonWins,
        regularSeasonLosses,
        regularSeasonTies,
        playoffWins: playoffWins ?? 0,
        playoffLosses: playoffLosses ?? 0,
        moves: moves ?? 0,
        pointsFor,
        pointsAgainst,
        powerRating,
        pointsForGameHigh,
        pointsForGameLow,
        playoffAppearance,
        playoffBye: Boolean(body.playoffBye),
        championshipWon,
    }
}

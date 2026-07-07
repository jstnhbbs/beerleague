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

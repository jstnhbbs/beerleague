import assert from 'node:assert/strict'
import {
    calculateSacrificeRound,
    DEFAULT_WAIVER_ROUND,
    MAX_SEASONS_ON_ROSTER,
    normalizeSeasonsOnRoster,
    resolveRoundKept,
} from '@/lib/keepers'
import {
    getHeadToHeadRecord,
    getManagerHeadToHeadSummary,
    parseHeadToHeadRecord,
    validateHeadToHeadData,
} from '@/lib/head-to-head'
import { computeManagerCareerStats } from '@/lib/stats'

function validateKeepers() {
    assert.equal(
        calculateSacrificeRound({
            playerKept: 'Player A',
            roundKept: 9,
            seasonsOnRoster: 1,
            firstRoundPick: null,
        }),
        '9'
    )
    assert.equal(
        calculateSacrificeRound({
            playerKept: 'Player A',
            roundKept: 9,
            seasonsOnRoster: 2,
            firstRoundPick: null,
        }),
        '8'
    )
    assert.equal(
        calculateSacrificeRound({
            playerKept: 'Player A',
            roundKept: 1,
            seasonsOnRoster: 1,
            firstRoundPick: null,
        }),
        'Not Eligible'
    )
    assert.equal(
        calculateSacrificeRound({
            playerKept: 'Player A',
            roundKept: 9,
            seasonsOnRoster: MAX_SEASONS_ON_ROSTER,
            firstRoundPick: null,
        }),
        'Not Eligible'
    )
    assert.equal(
        calculateSacrificeRound({
            playerKept: 'Player A',
            roundKept: 9,
            seasonsOnRoster: 1,
            firstRoundPick: 'player a',
        }),
        'Not Eligible'
    )
    assert.equal(
        resolveRoundKept('Waiver Player', null, null),
        DEFAULT_WAIVER_ROUND
    )
    assert.equal(normalizeSeasonsOnRoster(MAX_SEASONS_ON_ROSTER + 1), null)
}

function validateHeadToHead() {
    const errors = validateHeadToHeadData()
    assert.deepEqual(errors, [])

    assert.equal(getHeadToHeadRecord('Justin Hobbs', 'Dillon Reed'), '0-1')
    assert.deepEqual(parseHeadToHeadRecord('10-7-1'), {
        wins: 10,
        losses: 7,
        ties: 1,
        games: 18,
        winPct: 0.5833333333333334,
    })

    const justinSummary = getManagerHeadToHeadSummary('Justin Hobbs')
    assert.ok(justinSummary)
    assert.equal(justinSummary.wins, 90)
    assert.equal(justinSummary.losses, 80)
    assert.equal(justinSummary.ties, 1)
    assert.equal(justinSummary.games, 171)
}

function validateStats() {
    const stats = computeManagerCareerStats(1, [
        {
            id: 1,
            seasonId: 1,
            managerId: 1,
            teamName: 'Test Team',
            finish: 1,
            powerRating: 120,
            gamesPlayed: 14,
            wins: 10,
            losses: 4,
            ties: 0,
            moves: 12,
            pointsFor: 1400,
            pointsAgainst: 1200,
            pointsForGameHigh: null,
            pointsForGameLow: null,
            regularSeasonWins: 8,
            regularSeasonLosses: 4,
            regularSeasonTies: 0,
            playoffAppearance: true,
            playoffBye: false,
            playoffWins: 2,
            playoffLosses: 0,
            championshipWon: true,
            year: 2025,
        },
        {
            id: 2,
            seasonId: 2,
            managerId: 1,
            teamName: 'Other Team',
            finish: 5,
            powerRating: 90,
            gamesPlayed: 13,
            wins: 6,
            losses: 7,
            ties: 0,
            moves: 8,
            pointsFor: 1300,
            pointsAgainst: 1350,
            pointsForGameHigh: null,
            pointsForGameLow: null,
            regularSeasonWins: 6,
            regularSeasonLosses: 7,
            regularSeasonTies: 0,
            playoffAppearance: false,
            playoffBye: false,
            playoffWins: 0,
            playoffLosses: 0,
            championshipWon: false,
            year: 2024,
        },
    ])

    assert.equal(stats.championships, 1)
    assert.equal(stats.playoffWins, 2)
    assert.equal(stats.avgPowerRating, 105)
    assert.equal(stats.bestFinish, 1)
    assert.equal(stats.currentTeamName, 'Test Team')
}

validateKeepers()
validateHeadToHead()
validateStats()

console.log('History validation passed.')

import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core'

export const managers = sqliteTable('managers', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    currentTeamName: text('current_team_name'),
    createdAt: text('created_at').notNull(),
})

export const seasons = sqliteTable('seasons', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    year: integer('year').notNull().unique(),
})

export const seasonEntries = sqliteTable(
    'season_entries',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        seasonId: integer('season_id')
            .notNull()
            .references(() => seasons.id),
        managerId: integer('manager_id')
            .notNull()
            .references(() => managers.id),
        teamName: text('team_name').notNull(),
        finish: integer('finish').notNull(),
        powerRating: real('power_rating'),
        gamesPlayed: integer('games_played').notNull(),
        wins: integer('wins').notNull(),
        losses: integer('losses').notNull(),
        ties: integer('ties').notNull().default(0),
        moves: integer('moves').default(0),
        pointsFor: real('points_for').notNull(),
        pointsAgainst: real('points_against').notNull(),
        pointsForGameHigh: real('points_for_game_high'),
        pointsForGameLow: real('points_for_game_low'),
        regularSeasonWins: integer('regular_season_wins').notNull(),
        regularSeasonLosses: integer('regular_season_losses').notNull(),
        regularSeasonTies: integer('regular_season_ties').notNull().default(0),
        playoffAppearance: integer('playoff_appearance', { mode: 'boolean' })
            .notNull()
            .default(false),
        playoffBye: integer('playoff_bye', { mode: 'boolean' })
            .notNull()
            .default(false),
        playoffWins: integer('playoff_wins').notNull().default(0),
        playoffLosses: integer('playoff_losses').notNull().default(0),
        championshipWon: integer('championship_won', { mode: 'boolean' })
            .notNull()
            .default(false),
    },
    (table) => ({
        uniqueManagerSeason: unique().on(table.seasonId, table.managerId),
    })
)

export const dues = sqliteTable('dues', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    managerId: integer('manager_id')
        .notNull()
        .references(() => managers.id)
        .unique(),
    paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
    paymentMethod: text('payment_method'),
    updatedAt: text('updated_at').notNull(),
})

export type Manager = typeof managers.$inferSelect
export type Season = typeof seasons.$inferSelect
export type SeasonEntry = typeof seasonEntries.$inferSelect
export type Due = typeof dues.$inferSelect

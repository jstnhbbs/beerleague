import './load-env'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL ?? 'file:local.db'
const authToken = process.env.TURSO_AUTH_TOKEN
const client = createClient(authToken ? { url, authToken } : { url })

function sqlString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`
}

function updateTeamName(year: number, managerName: string, teamName: string): string {
    return `
        UPDATE season_entries
        SET team_name = ${sqlString(teamName)}
        WHERE manager_id = (SELECT id FROM managers WHERE name = ${sqlString(managerName)})
          AND season_id = (SELECT id FROM seasons WHERE year = ${year})
    `
}

function updateStats(
    year: number,
    managerName: string,
    assignments: Record<string, number>
): string {
    const setClause = Object.entries(assignments)
        .map(([column, value]) => `${column} = ${value}`)
        .join(', ')

    return `
        UPDATE season_entries
        SET ${setClause}
        WHERE manager_id = (SELECT id FROM managers WHERE name = ${sqlString(managerName)})
          AND season_id = (SELECT id FROM seasons WHERE year = ${year})
    `
}

const teamNames: Array<[number, string, string]> = [
    [2015, 'Paul Bullington', 'Beautiful Disasters'],
    [2015, 'Matt Organ', 'Forever Unclean'],
    [2015, 'Garrett Burkett', 'The Gnats'],
    [2015, 'Gregory Davis', 'Uptown Rafi Bombs'],
    [2015, 'Justin Hobbs', 'Calvin and Hobbs'],
    [2015, 'Matt Hamilton', 'Chronic Masterdeflaters'],
    [2015, 'Blade Healey', 'Taco Corp'],
    [2015, 'John Barker', 'Team Barker'],
    [2015, 'Tony Wilson', 'Team Wilson'],
    [2016, 'Tony Wilson', 'Camden Double U'],
    [2016, 'Paul Bullington', 'Uranus Kickers'],
    [2016, 'Brandon Church', 'The Kyles'],
    [2016, 'Blade Healey', 'Frodo Tea Baggins'],
    [2016, 'Gregory Davis', 'Rafi Bombs'],
    [2016, 'Garrett Burkett', 'The Gnats'],
    [2016, 'Justin Hobbs', 'PRESTIGE WORLDWIDE'],
    [2016, 'Logan Sartain', 'Justice Beaver'],
    [2016, 'Matt Hamilton', 'Chronic Masterdeflaters'],
    [2016, 'Matt Organ', "Who's Your Daddy"],
    [2017, 'Garrett Burkett', 'The Gnats'],
    [2017, 'Blade Healey', 'Frodo Tea Baggins'],
    [2017, 'Paul Bullington', 'Uranus Kickers'],
    [2017, 'Matt Hamilton', 'Green Eggs and Cam'],
    [2017, 'Justin Hobbs', 'A Song of Fire and Matty Ice'],
    [2017, 'Tony Wilson', 'Camden Double U'],
    [2017, 'Matt Organ', "Who's Your Daddy"],
    [2017, 'Gregory Davis', 'SCLS Mud Dogs'],
    [2018, 'Blade Healey', 'Frodo Tea Baggins'],
    [2018, 'Gregory Davis', 'SCLS Mud Dogs'],
    [2018, 'Matt Hamilton', 'Fumble IBUski'],
    [2018, 'Matt Organ', 'Sacko Champion'],
    [2018, 'Garrett Burkett', 'The Gnats'],
    [2018, 'Justin Hobbs', 'A Team Has No Name'],
    [2018, 'Tony Wilson', 'Camden Double U'],
    [2018, 'Paul Bullington', 'Uranus Kickers'],
    [2019, 'Paul Bullington', 'Chubb-y Bunnies'],
    [2019, 'Garrett Burkett', 'The Gnats'],
    [2019, 'Gregory Davis', 'SCLSU Mud Dogs'],
    [2019, 'Blade Healey', 'Frodo Tea Baggins'],
    [2019, 'Justin Hobbs', 'A Team Has No Name'],
    [2019, 'Tony Wilson', 'Camden Double U'],
    [2019, 'Matt Organ', 'Blade Top Paul Bottom'],
    [2019, 'Matt Hamilton', 'Fumble IBUski'],
    [2020, 'Garrett Burkett', 'The Gnats'],
    [2020, 'Blade Healey', 'Frodo Tea Baggins'],
    [2020, 'Justin Hobbs', 'A Team Has No Name'],
    [2020, 'Ethan Whiddon', 'Dallas Dingleberries'],
    [2020, 'Gregory Davis', 'Kalasi Killers'],
    [2020, 'Justin Dougher', 'OJ did it! Change my mind'],
    [2020, 'Matt Organ', 'Leonard Skinnereed'],
    [2020, 'Matt Hamilton', 'West Texas Winners'],
    [2020, 'Jackson Heard', 'Roger Good-Ale'],
    [2020, 'Paul Bullington', 'Chubb-y Bunnies'],
    [2021, 'Garrett Burkett', 'The Gnats'],
    [2021, 'Paul Bullington', 'Dead Animals'],
    [2021, 'Justin Dougher', 'Donda Donda Doooonda'],
    [2021, 'Ethan Whiddon', 'Dallas Dingleberries'],
    [2021, 'Justin Hobbs', 'A Team Has No Name'],
    [2021, 'Gregory Davis', 'Kalasi Killers'],
    [2021, 'Jackson Heard', 'Roger Good-Ale'],
    [2021, 'Blade Healey', 'Frodo Tea Baggins'],
    [2021, 'Matt Organ', 'Tyreek of Excellence'],
    [2021, 'Andrew Womble', 'Tyler Higbeer'],
    [2022, 'Garrett Burkett', 'The Gnats'],
    [2022, 'Jackson Heard', 'Roger Good-Ale'],
    [2022, 'Blade Healey', 'Frodo Tea Baggins'],
    [2022, 'Justin Dougher', 'Donda Donda Doooonda'],
    [2022, 'Gregory Davis', 'Back That Gla$$ Up'],
    [2022, 'Andrew Womble', 'DeAndre HOPSkins'],
    [2022, 'Paul Bullington', 'Dead Animals'],
    [2022, 'Ethan Whiddon', 'Big Fine Woman Dak That Azz Up'],
    [2022, 'Justin Hobbs', 'A Team Has No Name'],
    [2022, 'Matt Organ', "It's a Hard Knox Life"],
    [2023, 'Justin Hobbs', 'A Team Has No Name'],
    [2023, 'Garrett Burkett', 'The Gnats'],
    [2023, 'Michael Morales', 'Team Morales'],
    [2023, 'Blade Healey', 'Frodo Tea Baggins'],
    [2023, 'Jackson Heard', 'Roger Good-Ale'],
    [2023, 'Justin Dougher', 'Oh Period!'],
    [2023, 'Paul Bullington', 'Dead Animals'],
    [2023, 'Andrew Womble', 'DeAndre HOPSkins'],
    [2023, 'Gregory Davis', 'Back That Gla$$ Up'],
    [2023, 'Tony Wilson', 'Team Wilson'],
    [2024, 'Price Bahcall', 'Back That Gla$$ Up'],
    [2024, 'Justin Hobbs', 'A Team Has No Name'],
    [2024, 'Garrett Burkett', 'The Gnats'],
    [2024, 'Blade Healey', 'Frodo Tea Baggins'],
    [2024, 'Michael Morales', 'ZiegenBrock'],
    [2024, 'Matt Organ', 'Tua Finity and Bijan'],
    [2024, 'Jackson Heard', 'Roger Good-Ale'],
    [2024, 'Justin Dougher', "2-J's, 1-Kupp"],
    [2024, 'Paul Bullington', 'Complete Ass'],
    [2024, 'Andrew Womble', 'Even more ASS'],
    [2025, 'Andrew Womble', 'Uncle Rico Dynamite'],
    [2025, 'Garrett Burkett', 'The Gnats'],
    [2025, 'Dillon Reed', 'DDT'],
    [2025, 'Justin Dougher', 'Keepers are Gay'],
    [2025, 'Blade Healey', 'Frodo Tea Baggins'],
    [2025, 'Paul Bullington', 'Beautiful Disasters'],
    [2025, 'Matt Organ', 'M@'],
    [2025, 'Price Bahcall', 'GoldenShower'],
    [2025, 'Justin Hobbs', 'A Team Has No Name'],
    [2025, 'Michael Morales', 'ZiegenBrock'],
]

async function main() {
    const statements: string[] = [
        "UPDATE managers SET name = 'Gregory Davis' WHERE name = 'Greg Davis'",
        `
            UPDATE season_entries
            SET season_id = (SELECT id FROM seasons WHERE year = 2015),
                team_name = 'Team Barker',
                finish = 9
            WHERE manager_id = (SELECT id FROM managers WHERE name = 'John Barker')
              AND season_id = (SELECT id FROM seasons WHERE year = 2018)
        `,
        ...teamNames.map(([year, managerName, teamName]) =>
            updateTeamName(year, managerName, teamName)
        ),
        `
            INSERT INTO season_entries (
                season_id,
                manager_id,
                team_name,
                finish,
                power_rating,
                games_played,
                wins,
                losses,
                ties,
                moves,
                points_for,
                points_against,
                points_for_game_high,
                points_for_game_low,
                regular_season_wins,
                regular_season_losses,
                regular_season_ties,
                playoff_appearance,
                playoff_bye,
                playoff_wins,
                playoff_losses,
                championship_won
            )
            SELECT
                (SELECT id FROM seasons WHERE year = 2015),
                (SELECT id FROM managers WHERE name = 'Brandon Church'),
                'The Kyles',
                8,
                NULL,
                12,
                4,
                8,
                0,
                17,
                1537.0,
                1554.0,
                NULL,
                NULL,
                4,
                8,
                0,
                0,
                0,
                0,
                0,
                0
            WHERE NOT EXISTS (
                SELECT 1
                FROM season_entries
                WHERE season_id = (SELECT id FROM seasons WHERE year = 2015)
                  AND manager_id = (SELECT id FROM managers WHERE name = 'Brandon Church')
            )
        `,
        updateStats(2015, 'Garrett Burkett', { points_against: 1441.0 }),
        updateStats(2016, 'Brandon Church', {
            points_for: 1139.0,
            points_against: 1062.0,
        }),
        updateStats(2018, 'Blade Healey', {
            regular_season_wins: 10,
            regular_season_losses: 2,
            regular_season_ties: 0,
        }),
        updateStats(2018, 'Paul Bullington', { finish: 8 }),
        updateStats(2021, 'Gregory Davis', { points_for: 1394.82 }),
        updateStats(2022, 'Matt Organ', { points_against: 1246.88 }),
    ]

    await client.batch(statements)

    const counts = await client.execute(`
        SELECT s.year,
               COUNT(*) AS entries,
               MIN(e.finish) AS min_finish,
               MAX(e.finish) AS max_finish,
               COUNT(DISTINCT e.finish) AS distinct_finishes
        FROM season_entries e
        JOIN seasons s ON s.id = e.season_id
        GROUP BY s.year
        ORDER BY s.year
    `)

    console.table(counts.rows)
    console.log('History screenshot sync complete.')
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})

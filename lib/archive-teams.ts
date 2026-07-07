export const archiveTeams = [
    { id: '1', name: 'The Gnats' },
    { id: '2', name: 'A Team Has No Name' },
    { id: '3', name: 'Complete Ass' },
    { id: '4', name: 'Frodo Tea Baggins' },
    { id: '5', name: 'M@' },
    { id: '6', name: 'Uncle Rico Dynamite' },
    { id: '7', name: 'Keepers Are Gay' },
    { id: '8', name: 'ZiegenBrock' },
    { id: '9', name: 'Golden Shower' },
    { id: '10', name: 'DDT' },
] as const

export const archiveTeamSheets: Record<string, string> = {
    '1': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1978093567&single=true',
    '2': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1100028925&single=true',
    '3': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=581855790&single=true',
    '4': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=505574005&single=true',
    '5': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=952501783&single=true',
    '6': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=46682007&single=true',
    '7': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=556986276&single=true',
    '8': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=556170910&single=true',
    '9': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1328878134&single=true',
    '10': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ31Kptl6d-ElO2JuEQajDZZt18AGtCcxJ0fKSjEdOYuHb5cyqXFNaj5rG1YGVNt3kScTWtXyIFBmif/pubhtml?gid=1519094887&single=true',
}

export function getArchiveTeamName(teamId: string): string | undefined {
    return archiveTeams.find((team) => team.id === teamId)?.name
}

export function getArchiveTeamSheetUrl(teamId: string): string | undefined {
    return archiveTeamSheets[teamId]
}

export const ADMIN_ACCOUNTS = [
    {
        username: 'paul-bullington',
        displayName: 'Paul Bullington',
        passwordEnv: 'ADMIN_PASSWORD_PAUL',
    },
    {
        username: 'garrett-burkett',
        displayName: 'Garrett Burkett',
        passwordEnv: 'ADMIN_PASSWORD_GARRETT',
    },
    {
        username: 'justin-hobbs',
        displayName: 'Justin Hobbs',
        passwordEnv: 'ADMIN_PASSWORD_JUSTIN',
    },
] as const

export function normalizeAdminUsername(value: unknown): string {
    return String(value ?? '')
        .trim()
        .toLowerCase()
}

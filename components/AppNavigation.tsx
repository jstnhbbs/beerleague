import { getAdminSession } from '@/lib/auth'
import Navigation from './Navigation'

export default async function AppNavigation() {
    const adminSession = await getAdminSession()

    return <Navigation adminSession={adminSession} />
}

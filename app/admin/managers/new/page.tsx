import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import ManagerForm from './ManagerForm'
import '../../../almanac.css'

export default async function NewManagerPage() {
    if (!(await isAdmin())) redirect('/admin')

    return (
        <div className="container">
            <header className="almanac-hero">
                <p className="almanac-eyebrow">Admin</p>
                <h1 className="almanac-title">Add Manager</h1>
            </header>
            <ManagerForm />
        </div>
    )
}

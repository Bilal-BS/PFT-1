
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ShieldAlert } from 'lucide-react'

export default function ProtectedRoute({ role, children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [userRole, setUserRole] = useState(null)
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)

            if (session) {
                // Fetch profile & status in parallel
                const [profileRes, statusRes] = await Promise.all([
                    supabase.from('profiles').select('role').eq('id', session.user.id).single(),
                    supabase.from('user_status').select('is_active').eq('user_id', session.user.id).single()
                ])

                if (profileRes.data) setUserRole(profileRes.data.role)
                if (statusRes.data) setIsActive(statusRes.data.is_active)

                setLoading(false)
            } else {
                setLoading(false)
            }
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    )

    if (!session) {
        return <Navigate to="/login" replace />
    }

    if (!isActive && userRole !== 'superadmin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Access Revoked</h1>
                    <p className="text-slate-500 mb-6 font-medium">Your account has been restricted by an administrator. Please contact support if you believe this is a mistake.</p>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        )
    }

    if (role && userRole !== role && userRole !== null) {
        return <Navigate to="/" replace />
    }

    return children ? children : <Outlet />
}

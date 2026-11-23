import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/useAuth.js'

export default function RequireAdmin() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/discover" replace />
  return <Outlet />
}

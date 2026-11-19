import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth.js'

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <span className="label-mono">Universes colliding</span>
    </div>
  )
}

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (isLoading) return <Loading />
  return <Outlet />
}

export function PublicOnly() {
  const { isAuthenticated, landing } = useAuth()

  if (isAuthenticated) return <Navigate to={landing} replace />
  return <Outlet />
}

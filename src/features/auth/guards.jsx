import { Navigate, Outlet, useLocation } from 'react-router'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { useAuth } from './useAuth.js'

function Loading() {
  return <Loader full kicker="Grôncho" line={loadingLines.app} />
}

export function RequireAuth() {
  const { isAuthenticated, isLoading, loggedOut } = useAuth()
  const location = useLocation()

  if (!isAuthenticated && loggedOut) return <Navigate to="/" replace />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (isLoading) return <Loading />
  return <Outlet />
}

export function PublicOnly() {
  const { isAuthenticated, landing } = useAuth()

  if (isAuthenticated) return <Navigate to={landing} replace />
  return <Outlet />
}

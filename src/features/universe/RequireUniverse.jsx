import { useQuery } from '@tanstack/react-query'
import Loader from '@/components/Loader.jsx'
import { loadingLines } from '@/lib/loadingLines.js'
import { Navigate, Outlet } from 'react-router'
import { getMyUniverse } from '@/api/universes.js'
import { queryKeys } from '@/lib/queryKeys.js'

export default function RequireUniverse() {
  const universe = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })

  if (universe.data) return <Outlet />
  if (universe.error?.response?.status === 404) return <Navigate to="/universe/new" replace />
  if (universe.isError) return <Outlet />

  return <Loader full kicker="Grôncho" line={loadingLines.app} />
}

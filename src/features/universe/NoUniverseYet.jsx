import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router'
import { getMyUniverse } from '@/api/universes.js'
import { queryKeys } from '@/lib/queryKeys.js'

export default function NoUniverseYet() {
  const universe = useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
  const [hadUniverseOnArrival, setHadUniverseOnArrival] = useState(null)

  if (hadUniverseOnArrival === null && !universe.isPending) {
    setHadUniverseOnArrival(Boolean(universe.data))
  }

  if (hadUniverseOnArrival === null) return null
  if (hadUniverseOnArrival) return <Navigate to="/discover" replace />
  return <Outlet />
}

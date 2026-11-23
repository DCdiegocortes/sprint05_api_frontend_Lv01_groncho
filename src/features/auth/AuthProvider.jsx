import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth.js'
import { setUnauthorizedHandler } from '@/api/client.js'
import { getProfile } from '@/api/profile.js'
import { Role } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { clearToken, getToken, setToken } from '@/lib/session.js'
import { AuthContext } from './useAuth.js'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()))
  const [sessionEnded, setSessionEnded] = useState(false)
  const [landing, setLanding] = useState('/discover')
  const [loggedOut, setLoggedOut] = useState(false)

  const profile = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: hasToken,
  })

  const endSession = useCallback(() => {
    clearToken()
    setHasToken(false)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      endSession()
      setSessionEnded(true)
    })
  }, [endSession])

  const login = useCallback(
    async (credentials, redirectTo = '/discover') => {
      const { token } = await authApi.login(credentials)
      setToken(token)
      const user = await queryClient.fetchQuery({
        queryKey: queryKeys.profile,
        queryFn: getProfile,
      })
      setSessionEnded(false)
      setLoggedOut(false)
      setLanding(redirectTo)
      setHasToken(true)
      return user
    },
    [queryClient],
  )

  const register = useCallback(
    async (values) => {
      await authApi.register(values)
      return login({ email: values.email, password: values.password }, '/universe/new')
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setLanding('/discover')
      setLoggedOut(true)
      endSession()
    }
  }, [endSession])

  const clearLoggedOut = useCallback(() => setLoggedOut(false), [])

  const value = useMemo(
    () => ({
      user: profile.data ?? null,
      isAuthenticated: hasToken,
      isLoading: hasToken && profile.isPending,
      isAdmin: profile.data?.role === Role.ADMIN,
      sessionEnded,
      loggedOut,
      clearLoggedOut,
      landing,
      login,
      register,
      logout,
    }),
    [profile.data, profile.isPending, hasToken, sessionEnded, loggedOut, clearLoggedOut, landing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

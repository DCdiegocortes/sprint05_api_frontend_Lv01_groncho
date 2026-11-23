import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteUser, getUser, getUserItems, getUsers } from '@/api/users.js'
import { Role } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'

export const UNDO_MS = 5000

export const useUsers = () => useQuery({ queryKey: queryKeys.users, queryFn: getUsers })

export const useUser = (id) => useQuery({ queryKey: queryKeys.user(String(id)), queryFn: () => getUser(id), enabled: Boolean(id) })

export const useUserItems = (id) => useQuery({ queryKey: queryKeys.userItems(String(id)), queryFn: () => getUserItems(id), enabled: Boolean(id) })

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, id) => {
      queryClient.setQueryData(queryKeys.users, (list) => list?.filter((user) => user.id !== id))
      queryClient.removeQueries({ queryKey: queryKeys.user(String(id)) })
      return queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
  })
}

export const isAdmin = (user) => user?.role === Role.ADMIN

const joinedFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export const joined = (date, short = false) => (date ? (short ? monthFormat : joinedFormat).format(new Date(date)) : '')

export function matchesSearch(user, search) {
  const term = search.trim().toLowerCase()
  if (!term) return true
  return [user.name, user.email, user.handle].some((value) => value?.toLowerCase().includes(term))
}

export function useUndoableRemoval() {
  const [hidden, setHidden] = useState(() => new Set())
  const pending = useRef(new Map())

  useEffect(() => {
    const queue = pending.current
    return () =>
      queue.forEach(({ timer, commit }) => {
        clearTimeout(timer)
        commit()
      })
  }, [])

  const show = useCallback((ids) => {
    setHidden((current) => {
      const next = new Set(current)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }, [])

  const remove = useCallback(
    (ids, commit) => {
      const key = ids.join('-')
      setHidden((current) => new Set([...current, ...ids]))
      const run = () => Promise.resolve(commit()).finally(() => show(ids))
      const timer = setTimeout(() => {
        pending.current.delete(key)
        run()
      }, UNDO_MS)
      pending.current.set(key, { timer, commit: run })
      return () => {
        clearTimeout(pending.current.get(key)?.timer)
        pending.current.delete(key)
        show(ids)
      }
    },
    [show],
  )

  return { hidden, remove }
}

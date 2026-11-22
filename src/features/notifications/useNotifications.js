import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notifications.js'
import { queryKeys } from '@/lib/queryKeys.js'

const UNDO_MS = 5000

export function useNotifications(enabled = true) {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: getNotifications, enabled })
}

function useRefresh() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.notifications }), queryClient.invalidateQueries({ queryKey: queryKeys.unread })])
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: (id) => {
      queryClient.setQueryData(queryKeys.notifications, (list) =>
        list?.map((item) => (item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item)),
      )
      queryClient.setQueryData(queryKeys.unread, (count) => (count ? { unread: Math.max(0, count.unread - 1) } : count))
    },
    onSettled: refresh,
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  const refresh = useRefresh()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: () => {
      const now = new Date().toISOString()
      queryClient.setQueryData(queryKeys.notifications, (list) => list?.map((item) => ({ ...item, read_at: item.read_at ?? now })))
      queryClient.setQueryData(queryKeys.unread, { unread: 0 })
    },
    onSettled: refresh,
  })
}

export function useDeleteWithUndo() {
  const refresh = useRefresh()
  const [hidden, setHidden] = useState(() => new Set())
  const timers = useRef(new Map())

  useEffect(() => {
    const pending = timers.current
    return () =>
      pending.forEach(({ timer, commit }) => {
        clearTimeout(timer)
        commit()
      })
  }, [])

  const remove = useCallback(
    (id) => {
      setHidden((current) => new Set(current).add(id))
      const commit = () => deleteNotification(id).finally(refresh)
      const timer = setTimeout(() => {
        timers.current.delete(id)
        commit()
      }, UNDO_MS)
      timers.current.set(id, { timer, commit })
    },
    [refresh],
  )

  const undo = useCallback((id) => {
    clearTimeout(timers.current.get(id)?.timer)
    timers.current.delete(id)
    setHidden((current) => {
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }, [])

  return { hidden, remove, undo }
}

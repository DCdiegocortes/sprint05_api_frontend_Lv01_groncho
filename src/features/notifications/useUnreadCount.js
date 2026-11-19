import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/api/notifications.js'
import { queryKeys } from '@/lib/queryKeys.js'

export function useUnreadCount() {
  const query = useQuery({
    queryKey: queryKeys.unread,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  })

  return query.data?.unread ?? 0
}

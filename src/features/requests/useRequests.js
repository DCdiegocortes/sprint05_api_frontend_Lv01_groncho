import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { answerExchange, cancelExchange, getExchanges } from '@/api/exchanges.js'
import { ExchangeStatus } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'

export const isOpen = (request) => request.status === ExchangeStatus.PENDING || request.status === ExchangeStatus.ACCEPTED

const newestFirst = (a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)

export function useRequests(userId) {
  return useQuery({
    queryKey: queryKeys.exchanges,
    queryFn: getExchanges,
    enabled: Boolean(userId),
    select: (requests) => {
      const sorted = [...requests].sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || newestFirst(a, b))
      return {
        received: sorted.filter((request) => request.requester_id !== userId),
        sent: sorted.filter((request) => request.requester_id === userId),
      }
    },
  })
}

function useRefresh() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.exchanges }),
      queryClient.invalidateQueries({ queryKey: queryKeys.items }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myUniverse }),
    ])
}

export function useAnswerRequest() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: ({ id, status }) => answerExchange(id, status), onSuccess: refresh })
}

export function useCancelRequest() {
  const refresh = useRefresh()
  return useMutation({ mutationFn: cancelExchange, onSuccess: refresh })
}

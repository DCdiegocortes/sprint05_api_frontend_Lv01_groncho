import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExchange } from '@/api/exchanges.js'
import { closeMatch, getMatches, getMatchWardrobe } from '@/api/matches.js'
import { getUniverse } from '@/api/universes.js'
import { MatchStatus } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { displayStyle } from '@/features/universe/styles.js'

export const isActive = (match) => match?.status === MatchStatus.ACTIVE

export const partnerStyles = (match) => {
  const style = match?.partner?.universe?.style
  return style ? style.split(', ').map(displayStyle).join(' · ') : ''
}

export function useMatches() {
  return useQuery({ queryKey: queryKeys.matches, queryFn: getMatches })
}

export function useWardrobe(match) {
  return useQuery({
    queryKey: queryKeys.wardrobe(match?.id),
    queryFn: () => getMatchWardrobe(match.id),
    enabled: isActive(match),
  })
}

export function usePartnerUniverse(match) {
  const id = match?.partner?.universe?.id
  return useQuery({ queryKey: queryKeys.universe(id), queryFn: () => getUniverse(id), enabled: Boolean(id) })
}

export function useCloseMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closeMatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.matches }),
  })
}

export function useRequestPiece() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExchange,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.exchanges }),
  })
}

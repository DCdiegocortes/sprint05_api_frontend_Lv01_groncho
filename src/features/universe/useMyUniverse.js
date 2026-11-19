import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteUniverseImage,
  getMyUniverse,
  reorderUniverseImages,
  updateUniverse,
} from '@/api/universes.js'
import { queryKeys } from '@/lib/queryKeys.js'

export function useMyUniverse() {
  return useQuery({ queryKey: queryKeys.myUniverse, queryFn: getMyUniverse })
}

function useOptimistic(mutationFn, apply) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.myUniverse })
      const previous = queryClient.getQueryData(queryKeys.myUniverse)
      queryClient.setQueryData(queryKeys.myUniverse, apply(previous, variables))
      return { previous }
    },
    onError: (_error, _variables, context) => queryClient.setQueryData(queryKeys.myUniverse, context.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.myUniverse }),
  })
}

export function useUpdateUniverse(universeId) {
  return useOptimistic(
    (changes) => updateUniverse(universeId, changes),
    (previous, changes) => ({ ...previous, ...changes }),
  )
}

export function useReorderPhotos(universeId) {
  return useOptimistic(
    (images) => reorderUniverseImages(universeId, images.map((image) => image.id)),
    (previous, images) => ({ ...previous, images }),
  )
}

export function useDeletePhoto(universeId) {
  return useOptimistic(
    (imageId) => deleteUniverseImage(universeId, imageId),
    (previous, imageId) => ({ ...previous, images: previous.images.filter((image) => image.id !== imageId) }),
  )
}

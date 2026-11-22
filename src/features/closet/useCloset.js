import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createItem, deleteItem, deleteItemImages, getItems, updateItem, uploadItemImages } from '@/api/items.js'
import { queryKeys } from '@/lib/queryKeys.js'

export function useItems() {
  return useQuery({ queryKey: queryKeys.items, queryFn: getItems })
}

export function useSavePiece() {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)

  const save = async ({ piece, fields, files, removedImageIds }) => {
    setSaving(true)
    setProgress(0)
    try {
      const saved = piece ? await updateItem(piece.id, fields) : await createItem(fields)
      if (removedImageIds.length) await deleteItemImages(removedImageIds)
      if (files.length) await uploadItemImages(saved.id, files, setProgress)
      await queryClient.invalidateQueries({ queryKey: queryKeys.items })
      return saved
    } finally {
      setSaving(false)
    }
  }

  return { save, saving, progress }
}

export function useDeletePiece() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  })
}

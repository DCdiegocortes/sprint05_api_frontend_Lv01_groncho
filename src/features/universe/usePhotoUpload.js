import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { uploadUniverseImages } from '@/api/universes.js'
import { Limits } from '@/lib/constants.js'
import { queryKeys } from '@/lib/queryKeys.js'

export function checkPhotos(files) {
  const notImages = files.filter((file) => !file.type.startsWith('image/'))
  if (notImages.length) return 'Only photos can be added.'
  const tooBig = files.filter((file) => file.size > Limits.IMAGE_MAX_BYTES)
  if (tooBig.length) return tooBig.length === 1 ? `${tooBig[0].name} is over 10 MB.` : `${tooBig.length} photos are over 10 MB.`
  return null
}

export function usePhotoUpload(universeId) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState([])
  const [error, setError] = useState(null)

  const upload = async (fileList) => {
    const files = Array.from(fileList ?? [])
    if (!files.length) return
    const problem = checkPhotos(files)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const previews = files.map((file, index) => ({
      id: `${batchId}-${index}`,
      batchId,
      url: URL.createObjectURL(file),
      uploading: true,
      progress: 0,
    }))
    setPending((current) => [...current, ...previews])

    const update = (changes) =>
      setPending((current) => current.map((photo) => (photo.batchId === batchId ? { ...photo, ...changes } : photo)))

    try {
      await uploadUniverseImages(universeId, files, (progress) => update({ progress }))
      await queryClient.invalidateQueries({ queryKey: queryKeys.myUniverse })
    } catch (uploadError) {
      const message = uploadError?.response?.data?.message
      setError(message ?? 'The photos could not be uploaded. Try again.')
    } finally {
      previews.forEach((photo) => URL.revokeObjectURL(photo.url))
      setPending((current) => current.filter((photo) => photo.batchId !== batchId))
    }
  }

  return { pending, error, upload }
}

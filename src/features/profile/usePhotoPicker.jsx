import { useRef, useState } from 'react'
import { checkPhotos } from '@/features/universe/usePhotoUpload.js'
import { fieldErrors, useUploadAvatar } from './useProfile.js'

export function usePhotoPicker() {
  const input = useRef(null)
  const upload = useUploadAvatar()
  const [error, setError] = useState('')

  const pick = (fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const problem = checkPhotos([file])
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    upload.mutate(file, {
      onError: (failure) => setError(fieldErrors(failure).avatar ?? fieldErrors(failure).root),
    })
  }

  const field = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      hidden
      data-testid="avatar-input"
      onChange={(event) => {
        pick(event.target.files)
        event.target.value = ''
      }}
    />
  )

  return {
    open: () => input.current?.click(),
    field,
    error,
    busy: upload.isPending,
  }
}

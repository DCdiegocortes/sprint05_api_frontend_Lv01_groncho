import { useRef, useState } from 'react'
import { checkPhotos } from '@/features/universe/usePhotoUpload.js'
import AvatarCropPanel from './AvatarCropPanel.jsx'
import { fieldErrors, useUploadAvatar } from './useProfile.js'

export function usePhotoPicker() {
  const input = useRef(null)
  const upload = useUploadAvatar()
  const [error, setError] = useState('')
  const [chosen, setChosen] = useState(null)

  const open = () => input.current?.click()

  const pick = (fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const problem = checkPhotos([file])
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    setChosen({ file, url: URL.createObjectURL(file) })
  }

  const close = () =>
    setChosen((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return null
    })

  const use = (cropped) =>
    upload.mutate(cropped, {
      onSuccess: close,
      onError: (failure) => {
        close()
        setError(fieldErrors(failure).avatar ?? fieldErrors(failure).root)
      },
    })

  const field = (
    <>
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
      {chosen && (
        <AvatarCropPanel
          key={chosen.url}
          file={chosen.file}
          url={chosen.url}
          busy={upload.isPending}
          onUse={use}
          onChooseAnother={open}
          onClose={close}
        />
      )}
    </>
  )

  return { open, field, error, busy: upload.isPending }
}

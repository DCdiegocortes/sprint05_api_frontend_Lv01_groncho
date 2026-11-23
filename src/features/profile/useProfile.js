import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeAvatar, updateProfile, uploadAvatar } from '@/api/profile.js'
import { queryKeys } from '@/lib/queryKeys.js'

function useProfileMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (user) => {
      if (user?.id) queryClient.setQueryData(queryKeys.profile, user)
      return queryClient.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export const useUpdateProfile = () => useProfileMutation(updateProfile)
export const useUploadAvatar = () => useProfileMutation(uploadAvatar)
export const useRemoveAvatar = () => useProfileMutation(removeAvatar)

export const fieldErrors = (error) =>
  error?.response?.status === 422
    ? Object.fromEntries(Object.entries(error.response.data?.errors ?? {}).map(([field, messages]) => [field, messages[0]]))
    : {
        root: error?.response?.data?.message ?? 'That did not go through. Try again.',
      }

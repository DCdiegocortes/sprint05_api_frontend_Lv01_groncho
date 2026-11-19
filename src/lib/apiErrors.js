export function applyApiErrors(error, setError, fallback = 'Something went wrong. Try again.') {
  const response = error?.response
  const fieldErrors = response?.status === 422 ? response.data?.errors : null

  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      setError(field, { type: 'server', message: messages[0] })
    }
    return
  }

  setError('root', { type: 'server', message: response?.data?.message ?? fallback })
}

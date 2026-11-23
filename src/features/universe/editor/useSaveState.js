import { useEffect, useState } from 'react'

const SHOW_SAVING_AFTER_MS = 300
const SAVED_FOR_MS = 1600

export function useSaveState({ busy, failed }) {
  const [phase, setPhase] = useState('idle')
  const [wasBusy, setWasBusy] = useState(busy)

  if (busy !== wasBusy) {
    setWasBusy(busy)
    setPhase(busy ? 'pending' : 'saved')
  }

  useEffect(() => {
    if (phase === 'pending') {
      const timer = setTimeout(() => setPhase('saving'), SHOW_SAVING_AFTER_MS)
      return () => clearTimeout(timer)
    }
    if (phase === 'saved') {
      const timer = setTimeout(() => setPhase('idle'), SAVED_FOR_MS)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase])

  if (failed) return 'failed'
  if (phase === 'pending') return 'idle'
  return phase
}

import { useEffect, useState } from 'react'

const cache = new Map()

export function useImageRatios(urls) {
  const [, setVersion] = useState(0)
  const key = urls.join('|')

  useEffect(() => {
    let alive = true
    key
      .split('|')
      .filter((url) => url && !cache.has(url))
      .forEach((url) => {
        const image = new Image()
        image.onload = () => {
          cache.set(url, image.naturalHeight / image.naturalWidth)
          if (alive) setVersion((value) => value + 1)
        }
        image.src = url
      })
    return () => {
      alive = false
    }
  }, [key])

  return (url) => cache.get(url)
}

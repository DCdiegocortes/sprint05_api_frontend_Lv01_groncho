let apiPromise = null

export function loadSpotifyApi() {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api)
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)
  })
  return apiPromise
}

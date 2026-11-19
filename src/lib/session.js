const TOKEN_KEY = 'groncho.token'

let token = readStoredToken()

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken() {
  return token
}

export function setToken(value) {
  token = value
  try {
    localStorage.setItem(TOKEN_KEY, value)
  } catch {
    return
  }
}

export function clearToken() {
  token = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    return
  }
}

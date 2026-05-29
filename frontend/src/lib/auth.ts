const TOKEN_KEY = "inventrack_token"

export const DEMO_EMAIL = "demo@inventrack.app"

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function login(): void {
  localStorage.setItem(TOKEN_KEY, "fake-demo-token")
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
}

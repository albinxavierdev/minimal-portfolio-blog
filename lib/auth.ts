const AUTH_KEY = 'blog_admin_auth'
const ADMIN_PASSWORD = 'admin123' // Default password - should be changed in production

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, 'authenticated')
      return true
    }
  }
  return false
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_KEY) === 'authenticated'
}

export function checkAuth(): boolean {
  return isAuthenticated()
}

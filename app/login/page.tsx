'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, isAuthenticated } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      const redirect = searchParams.get('redirect') || '/admin'
      router.push(redirect)
    }
  }, [router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (login(password)) {
      const redirect = searchParams.get('redirect') || '/admin'
      router.push(redirect)
      router.refresh()
    } else {
      setError('incorrect password.')
      setLoading(false)
    }
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, width: '100%', padding: '24px' }}>
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
            ← back to blog
          </Link>
        </div>

        <h1 className="fade-up fade-up-delay-1" style={{
          fontFamily: 'Lora, Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(1.6rem, 5vw, 2rem)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          marginBottom: 12,
        }}>
          admin login.
        </h1>

        <p className="fade-up fade-up-delay-2" style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 40, fontWeight: 300 }}>
          enter password to access admin panel.
        </p>

        <form onSubmit={handleSubmit} className="fade-up fade-up-delay-3">
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: '0.72rem',
              color: 'var(--muted)',
              letterSpacing: '0.06em',
              marginBottom: 8,
            }}>
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="enter admin password"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '12px 0',
                fontSize: '0.95rem',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 300,
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              autoFocus
            />
          </div>

          {error && (
            <p style={{ fontSize: '0.82rem', color: '#cc4444', marginBottom: 20 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: '0.88rem',
              padding: '12px 32px',
              background: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
              width: '100%',
            }}
          >
            {loading ? 'logging in...' : 'login →'}
          </button>
        </form>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 24, fontWeight: 300, textAlign: 'center' }}>
          default password: <code style={{ background: 'var(--hover)', padding: '2px 6px', borderRadius: 3 }}>admin123</code>
        </p>
      </div>
    </main>
  )
}

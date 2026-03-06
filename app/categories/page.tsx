'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as store from '@/lib/store-client'
import { isAuthenticated } from '@/lib/auth'
import { Category } from '@/types'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [postCounts, setPostCounts] = useState<Record<string, number>>({})
  const [form, setForm] = useState({ name: '', description: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function init() {
      setMounted(true)
      if (!isAuthenticated()) {
        router.push('/login?redirect=/categories')
        return
      }
      await load()
    }
    init()
  }, [router])

  async function load() {
    try {
      const [cats, posts] = await Promise.all([
        store.getCategories(),
        store.getPosts(),
      ])
      setCategories(cats)
      const counts: Record<string, number> = {}
      cats.forEach(c => {
        counts[c.slug] = posts.filter(p => p.category === c.slug).length
      })
      setPostCounts(counts)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  if (!mounted || !isAuthenticated()) return null

  const handleAdd = async () => {
    if (!form.name.trim()) { setError('name is required.'); return }
    try {
      await store.createCategory(form)
      setForm({ name: '', description: '' })
      setAdding(false)
      setError('')
      await load()
    } catch (error) {
      console.error('Failed to create category:', error)
      setError('Failed to create category')
    }
  }

  const handleDelete = async (cat: Category) => {
    const count = postCounts[cat.slug] || 0
    const msg = count > 0
      ? `delete "${cat.name}"? this category has ${count} post(s) — they won't be deleted, just uncategorized.`
      : `delete "${cat.name}"?`
    if (!confirm(msg)) return
    try {
      await store.deleteCategory(cat.id)
      await load()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    padding: '8px 0',
    fontSize: '0.9rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 300,
    color: 'var(--text)',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    marginBottom: 4,
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '80px 24px 120px' }}>

        <div className="fade-up" style={{ marginBottom: 56 }}>
          <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
            ← back to writing
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
          categories.
        </h1>

        <p className="fade-up fade-up-delay-2" style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 48, fontWeight: 300, lineHeight: 1.7 }}>
          organize your writing into topics.
        </p>

        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 32 }} />

        {/* Category list */}
        <div className="fade-up fade-up-delay-3" style={{ marginBottom: 40 }}>
          {categories.length === 0 && (
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', paddingBottom: 24 }}>no categories yet.</p>
          )}
          {categories.map(cat => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                paddingBottom: 20,
                marginBottom: 20,
                borderBottom: '1px solid var(--border)',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'Lora, serif', fontWeight: 400, fontSize: '1rem', color: 'var(--text)' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                    {postCounts[cat.slug] || 0} post{postCounts[cat.slug] !== 1 ? 's' : ''}
                  </span>
                </div>
                {cat.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 3, fontWeight: 300 }}>
                    {cat.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(cat)}
                style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', borderBottom: '1px solid #eecaca', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 300, flexShrink: 0 }}
              >
                delete
              </button>
            </div>
          ))}
        </div>

        {/* Add form */}
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="fade-up fade-up-delay-4"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              fontSize: '0.85rem',
              background: 'none',
              border: '1px solid var(--border)',
              padding: '8px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              color: 'var(--muted)',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
          >
            + add category
          </button>
        ) : (
          <div className="fade-up" style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>name</label>
              <input
                autoFocus
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. essays"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={labelStyle}>description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="one short line"
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>
            {error && <p style={{ fontSize: '0.82rem', color: '#cc4444' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button
                onClick={handleAdd}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 300,
                  fontSize: '0.85rem',
                  padding: '8px 20px',
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                add →
              </button>
              <button
                onClick={() => { setAdding(false); setForm({ name: '', description: '' }); setError('') }}
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

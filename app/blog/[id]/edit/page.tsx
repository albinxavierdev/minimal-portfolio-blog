'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import * as store from '@/lib/store-client'
import { isAuthenticated } from '@/lib/auth'
import { Category, Post } from '@/types'
import MarkdownEditor from '@/components/MarkdownEditor'

export default function EditPost() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: '', parentId: '', featuredImage: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function load() {
      setMounted(true)
      if (!isAuthenticated()) {
        router.push(`/login?redirect=/blog/${id}/edit`)
        return
      }
      try {
        const post = await store.getPost(id)
        if (!post) {
          router.push('/')
          return
        }
        const topPosts = (await store.getTopLevelPosts()).filter(p => p.id !== id)
        setForm({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          parentId: post.parentId || '',
          featuredImage: post.featuredImage || '',
        })
        const cats = await store.getCategories()
        setCategories(cats)
        setPosts(topPosts)
        setLoaded(true)
      } catch (error) {
        console.error('Failed to load post:', error)
        router.push('/')
      }
    }
    load()
  }, [id, router])

  if (!mounted || !isAuthenticated()) return null

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('title is required.'); return }
    if (!form.content.trim()) { setError('content is required.'); return }
    setSaving(true)
    try {
      const updateData: Partial<Post> = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        category: form.category,
      }
      if (form.parentId) updateData.parentId = form.parentId
      else updateData.parentId = undefined
      if (form.featuredImage) updateData.featuredImage = form.featuredImage
      await store.updatePost(id, updateData)
      router.push(`/blog/${id}`)
    } catch (error) {
      console.error('Failed to update post:', error)
      setError('Failed to update post. Please try again.')
      setSaving(false)
    }
  }

  if (!loaded) return null

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    padding: '10px 0',
    fontSize: '0.95rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 300,
    color: 'var(--text)',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--muted)',
    letterSpacing: '0.06em',
    marginBottom: 6,
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '80px 24px 120px' }}>

        <div className="fade-up" style={{ marginBottom: 56 }}>
          <Link href={`/blog/${id}`} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
            ← back
          </Link>
        </div>

        <h1 className="fade-up fade-up-delay-1" style={{
          fontFamily: 'Lora, Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(1.6rem, 5vw, 2rem)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          marginBottom: 48,
        }}>
          edit post.
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          <div className="fade-up fade-up-delay-2">
            <label style={labelStyle}>title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={{ ...inputStyle, fontSize: '1.1rem' }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
            />
          </div>

          <div className="fade-up fade-up-delay-2">
            <label style={labelStyle}>category</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, category: cat.slug })}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.78rem',
                    fontWeight: 300,
                    padding: '4px 14px',
                    borderRadius: 20,
                    border: '1px solid',
                    borderColor: form.category === cat.slug ? 'var(--text)' : 'var(--border)',
                    background: form.category === cat.slug ? 'var(--text)' : 'transparent',
                    color: form.category === cat.slug ? 'var(--bg)' : 'var(--muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="fade-up fade-up-delay-3">
            <label style={labelStyle}>excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
            />
          </div>

          {/* Featured Image */}
          <div className="fade-up fade-up-delay-3">
            <label style={labelStyle}>featured image url (optional)</label>
            <input
              type="text"
              value={form.featuredImage}
              onChange={e => setForm({ ...form, featuredImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={inputStyle}
              onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
            />
          </div>

          {/* Parent Page (Subpage) */}
          {posts.length > 0 && (
            <div className="fade-up fade-up-delay-3">
              <label style={labelStyle}>parent page (optional - make this a subpage)</label>
              <select
                value={form.parentId}
                onChange={e => setForm({ ...form, parentId: e.target.value })}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  background: 'transparent',
                }}
              >
                <option value="">none (top-level page)</option>
                {posts.map(post => (
                  <option key={post.id} value={post.id}>{post.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="fade-up fade-up-delay-4">
            <label style={labelStyle}>content (markdown supported)</label>
            <MarkdownEditor
              value={form.content}
              onChange={(value) => setForm({ ...form, content: value })}
              rows={18}
            />
          </div>

          {error && <p style={{ fontSize: '0.82rem', color: '#cc4444' }}>{error}</p>}

          <div className="fade-up fade-up-delay-5" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 300,
                fontSize: '0.88rem',
                padding: '10px 24px',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 4,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'saving...' : 'save changes →'}
            </button>
            <Link href={`/blog/${id}`} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
              cancel
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}

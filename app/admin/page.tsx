'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated, logout } from '@/lib/auth'
import * as store from '@/lib/store-client'
import { Post, Category } from '@/types'
import FontSelector from '@/components/FontSelector'

export default function AdminPanel() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function load() {
      setMounted(true)
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }
      try {
        const [postsData, categoriesData] = await Promise.all([
          store.getPosts(),
          store.getCategories(),
        ])
        setPosts(postsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to load admin data:', error)
      }
    }
    load()
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
    router.refresh()
  }

  if (!mounted) return null

  if (!isAuthenticated()) {
    return null
  }

  const totalPosts = posts.length
  const totalCategories = categories.length
  const postsByCategory = categories.reduce((acc, cat) => {
    acc[cat.slug] = posts.filter(p => p.category === cat.slug).length
    return acc
  }, {} as Record<string, number>)

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase()
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: 'Lora, Georgia, serif',
              fontWeight: 500,
              fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              marginBottom: 8,
            }}>
              admin panel.
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 300 }}>
              manage your blog content and settings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <FontSelector />
            <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              view blog
            </Link>
            <button
              onClick={handleLogout}
              style={{ fontSize: '0.82rem', color: 'var(--muted)', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up fade-up-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 60 }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '24px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 8 }}>total posts</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--text)' }}>{totalPosts}</div>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '24px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 8 }}>categories</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 400, color: 'var(--text)' }}>{totalCategories}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="fade-up fade-up-delay-2" style={{ marginBottom: 60 }}>
          <h2 style={{
            fontFamily: 'Lora, serif',
            fontWeight: 400,
            fontSize: '1.3rem',
            marginBottom: 20,
          }}>
            quick actions
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              href="/blog/new"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                padding: '10px 24px',
                background: 'var(--text)',
                color: 'var(--bg)',
                border: 'none',
                borderRadius: 4,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              + new post
            </Link>
            <Link
              href="/categories"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              manage categories
            </Link>
            <Link
              href="/admin/landing"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.88rem',
                padding: '10px 24px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              edit landing page
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="fade-up fade-up-delay-3" style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'Lora, serif',
              fontWeight: 400,
              fontSize: '1.3rem',
            }}>
              recent posts
            </h2>
            <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              view all →
            </Link>
          </div>

          {posts.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', paddingTop: 8 }}>
              no posts yet.{' '}
              <Link href="/blog/new" style={{ color: 'var(--text)', borderBottom: '1px solid #ccc', textDecoration: 'none' }}>
                create the first one →
              </Link>
            </p>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              {posts.slice(0, 10).map((post, i) => (
                <div
                  key={post.id}
                  style={{
                    padding: '20px 24px',
                    borderBottom: i < Math.min(posts.length, 10) - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                        {post.category}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      style={{
                        fontFamily: 'Lora, serif',
                        fontSize: '1.1rem',
                        color: 'var(--text)',
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      {post.title}
                    </Link>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300 }}>
                      {post.excerpt}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <Link
                      href={`/blog/${post.id}/edit`}
                      style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                    >
                      edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Overview */}
        <div className="fade-up fade-up-delay-4">
          <h2 style={{
            fontFamily: 'Lora, serif',
            fontWeight: 400,
            fontSize: '1.3rem',
            marginBottom: 24,
          }}>
            categories
          </h2>

          {categories.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', paddingTop: 8 }}>
              no categories yet.{' '}
              <Link href="/categories" style={{ color: 'var(--text)', borderBottom: '1px solid #ccc', textDecoration: 'none' }}>
                create one →
              </Link>
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '20px',
                  }}
                >
                  <div style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: 8 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12, fontWeight: 300 }}>
                    {cat.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {postsByCategory[cat.slug] || 0} post{postsByCategory[cat.slug] !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import * as store from '@/lib/store-client'
import { isAuthenticated } from '@/lib/auth'
import { Post } from '@/types'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function BlogPost() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [subpages, setSubpages] = useState<Post[]>([])
  const [parentPost, setParentPost] = useState<Post | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const found = await store.getPost(id)
        if (!found) {
          router.push('/')
          return
        }
        setPost(found)
        const subpagesData = await store.getSubpages(id)
        setSubpages(subpagesData)
        if (found.parentId) {
          const parent = await store.getPost(found.parentId)
          setParentPost(parent || null)
        }
        setAuthenticated(isAuthenticated())
      } catch (error) {
        console.error('Failed to load post:', error)
        router.push('/')
      }
    }
    load()
  }, [id, router])

  if (!post) return null

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }).toLowerCase()
  }

  const handleDelete = async () => {
    if (!confirm(`delete "${post.title}"?`)) return
    try {
      await store.deletePost(post.id)
      router.push('/')
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* nav */}
        <div className="fade-up" style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              ← back
            </Link>
            {parentPost && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <Link href={`/blog/${parentPost.id}`} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                  {parentPost.title}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* category */}
        <div className="fade-up fade-up-delay-1" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>
            {post.category}
          </span>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="fade-up fade-up-delay-1" style={{ marginBottom: 32 }}>
            <img
              src={post.featuredImage}
              alt={post.title}
              style={{
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 4,
                display: 'block',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}

        {/* title */}
        <h1 className="fade-up fade-up-delay-2" style={{
          fontFamily: 'Lora, Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(1.6rem, 5vw, 2rem)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          marginBottom: 20,
        }}>
          {post.title}
        </h1>

        {/* meta */}
        <div className="fade-up fade-up-delay-3" style={{ display: 'flex', gap: 16, marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{formatDate(post.date)}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{post.readTime} min read</span>
        </div>

        {/* content */}
        <div className="fade-up fade-up-delay-4" style={{ marginBottom: 60 }}>
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Subpages */}
        {subpages.length > 0 && (
          <div className="fade-up fade-up-delay-5" style={{ marginBottom: 60, paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            <h2 style={{
              fontFamily: 'Lora, serif',
              fontWeight: 400,
              fontSize: '1.3rem',
              marginBottom: 24,
            }}>
              subpages
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subpages.map(subpage => (
                <Link
                  key={subpage.id}
                  href={`/blog/${subpage.id}`}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    textDecoration: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--text)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  }}
                >
                  <div style={{ fontFamily: 'Lora, serif', fontSize: '1.1rem', marginBottom: 6, color: 'var(--text)' }}>
                    {subpage.title}
                  </div>
                  {subpage.excerpt && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300 }}>
                      {subpage.excerpt}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* actions */}
        {authenticated && (
          <div className="fade-up fade-up-delay-5" style={{ display: 'flex', gap: 20, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <Link
              href={`/blog/${post.id}/edit`}
              style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
            >
              edit this post
            </Link>
            <button
              onClick={handleDelete}
              style={{ fontSize: '0.82rem', color: '#cc4444', background: 'none', border: 'none', borderBottom: '1px solid #eecaca', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
            >
              delete
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

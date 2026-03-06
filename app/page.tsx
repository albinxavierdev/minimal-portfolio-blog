'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import * as store from '@/lib/store-client'
import { isAuthenticated } from '@/lib/auth'
import { Post, Category, LandingPageSection, LandingPageLink, LandingPageEvent, SocialMediaLink } from '@/types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [postsData, categoriesData] = await Promise.all([
          store.getPosts(),
          store.getCategories(),
        ])
        setPosts(postsData)
        setCategories(categoriesData)
        setAuthenticated(isAuthenticated())
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`delete "${title}"?`)) return
    try {
      await store.deletePost(id)
      const updatedPosts = await store.getPosts()
      setPosts(updatedPosts)
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase()
  }

  if (loading) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>loading...</div>
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', padding: '80px 24px 120px' }}>

        {/* ── DYNAMIC SECTIONS ── */}
        <LandingPageSections authenticated={authenticated} />

        {/* ── CATEGORY FILTER ── */}
        <section className="fade-up fade-up-delay-2" style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 300,
                padding: '5px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: activeCategory === 'all' ? 'var(--text)' : 'var(--border)',
                background: activeCategory === 'all' ? 'var(--text)' : 'transparent',
                color: activeCategory === 'all' ? 'var(--bg)' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              all
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 300,
                  padding: '5px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: activeCategory === cat.slug ? 'var(--text)' : 'var(--border)',
                  background: activeCategory === cat.slug ? 'var(--text)' : 'transparent',
                  color: activeCategory === cat.slug ? 'var(--bg)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── DIVIDER ── */}
        <div className="fade-up fade-up-delay-3" style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

        {/* ── POST LIST ── */}
        <section>
          {filtered.length === 0 && (
            <div className="fade-up fade-up-delay-4" style={{ color: 'var(--muted)', fontSize: '0.9rem', paddingTop: 8 }}>
              nothing here yet.{' '}
              <Link href="/blog/new" style={{ color: 'var(--text)', borderBottom: '1px solid #ccc', textDecoration: 'none' }}>
                write the first one →
              </Link>
            </div>
          )}

          {filtered.map((post, i) => (
            <article
              key={post.id}
              className={`fade-up fade-up-delay-${Math.min(i + 4, 6)}`}
              style={{
                paddingBottom: 32,
                marginBottom: 32,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* category tag */}
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.72rem',
                  color: 'var(--muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'lowercase',
                }}>
                  {post.category}
                </span>
              </div>

              {/* title */}
              <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.2rem',
                  lineHeight: 1.35,
                  color: 'var(--text)',
                  marginBottom: 10,
                  transition: 'opacity 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {post.title}
                </h2>
              </Link>

              {/* excerpt */}
              <p style={{
                fontWeight: 300,
                color: '#666',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                marginBottom: 14,
              }}>
                {post.excerpt}
              </p>

              {/* meta + actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{formatDate(post.date)}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{post.readTime} min read</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link
                    href={`/blog/${post.id}`}
                    style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                  >
                    read →
                  </Link>
                  {authenticated && (
                    <>
                      <Link
                        href={`/blog/${post.id}/edit`}
                        style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                      >
                        edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderBottom: '1px solid #eecaca', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
                      >
                        delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 300 }}>
            being bored with albin
            {authenticated && (
              <>
                {' · '}
                <Link href="/blog/new" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
                  write something
                </Link>
              </>
            )}
          </p>
        </footer>

      </div>
    </main>
  )
}

function LandingPageSections({ authenticated }: { authenticated: boolean }) {
  const [sections, setSections] = useState<LandingPageSection[]>([])
  const [links, setLinks] = useState<Record<string, LandingPageLink[]>>({})
  const [events, setEvents] = useState<Record<string, LandingPageEvent[]>>({})
  const [social, setSocial] = useState<Record<string, SocialMediaLink[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const sectionsData = await store.getLandingSections()
        setSections(sectionsData)

        // Load links, events, and social for each section
        const linksMap: Record<string, LandingPageLink[]> = {}
        const eventsMap: Record<string, LandingPageEvent[]> = {}
        const socialMap: Record<string, SocialMediaLink[]> = {}

        for (const section of sectionsData) {
          if (section.type === 'links') {
            linksMap[section.id] = await store.getLandingLinks(section.id)
          } else if (section.type === 'events') {
            eventsMap[section.id] = await store.getLandingEvents(section.id)
          } else if (section.type === 'social') {
            socialMap[section.id] = await store.getLandingSocial(section.id)
          }
        }

        setLinks(linksMap)
        setEvents(eventsMap)
        setSocial(socialMap)
      } catch (error) {
        console.error('Failed to load landing sections:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="fade-up" style={{ marginBottom: 64 }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>loading...</div>
      </section>
    )
  }

  if (sections.length === 0) {
    // Default content if no sections exist
    return (
      <section className="fade-up" style={{ marginBottom: 64 }}>
        <h1 style={{
          fontFamily: 'Lora, Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(1.7rem, 5vw, 2.1rem)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          marginBottom: 24,
        }}>
          writing things down.
        </h1>
        <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.8, fontSize: '1rem', maxWidth: 440 }}>
          hi. this is where i put ideas that won't leave me alone. essays, notes, half-finished thoughts.
          {' '}mostly for me. maybe useful for you.
        </p>
      </section>
    )
  }

  return (
    <>
      {sections.map((section, index) => (
        <section
          key={section.id}
          className={`fade-up ${index > 0 ? `fade-up-delay-${Math.min(index, 6)}` : ''}`}
          style={{ marginBottom: 64 }}
        >
          {section.type === 'hero' && (
            <>
              {section.title && (
                <h1 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 500,
                  fontSize: 'clamp(1.7rem, 5vw, 2.1rem)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  marginBottom: 24,
                }}>
                  {section.title}
                </h1>
              )}
              {section.content && (
                <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.8, fontSize: '1rem', maxWidth: 440 }}>
                  {section.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line.includes('[') && line.includes('](') ? (
                        line.split(/(\[.*?\]\(.*?\))/g).map((part, j) => {
                          const match = part.match(/\[(.*?)\]\((.*?)\)/)
                          if (match) {
                            return (
                              <a
                                key={j}
                                href={match[2]}
                                style={{ color: 'var(--text)', borderBottom: '1px solid #ccc', textDecoration: 'none', paddingBottom: 1 }}
                              >
                                {match[1]}
                              </a>
                            )
                          }
                          return part
                        })
                      ) : (
                        line
                      )}
                      {i < section.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
            </>
          )}

          {section.type === 'text' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  lineHeight: 1.3,
                  marginBottom: 16,
                }}>
                  {section.title}
                </h2>
              )}
              {section.content && (
                <div style={{ fontWeight: 300, color: '#555', lineHeight: 1.8, fontSize: '1rem' }}>
                  {section.content.split('\n').map((line, i) => (
                    <p key={i} style={{ marginBottom: '1em' }}>{line}</p>
                  ))}
                </div>
              )}
            </>
          )}

          {section.type === 'links' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}>
                  {section.title}
                </h2>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links[section.id]?.map(link => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: 2,
                      display: 'inline-block',
                      width: 'fit-content',
                    }}
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            </>
          )}

          {section.type === 'events' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}>
                  {section.title}
                </h2>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {events[section.id]?.map(event => (
                  <div key={event.id}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLowerCase()}
                      </span>
                      {event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--muted)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          link →
                        </a>
                      )}
                    </div>
                    <h3 style={{
                      fontFamily: 'Lora, serif',
                      fontSize: '1.1rem',
                      fontWeight: 400,
                      marginBottom: 4,
                    }}>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {section.type === 'social' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}>
                  {section.title}
                </h2>
              )}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {social[section.id]?.map(item => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--text)',
                      textDecoration: 'none',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: 2,
                    }}
                  >
                    {item.platform}
                  </a>
                ))}
              </div>
            </>
          )}

          {section.type === 'image' && (
            <>
              {section.title && (
                <h2 style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400,
                  fontSize: '1.4rem',
                  lineHeight: 1.3,
                  marginBottom: 20,
                }}>
                  {section.title}
                </h2>
              )}
              {section.metadata?.imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={section.metadata.imageUrl}
                    alt={section.metadata.imageAlt || section.title || 'Image'}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 4,
                    }}
                  />
                </div>
              )}
              {section.content && (
                <p style={{ fontWeight: 300, color: '#555', lineHeight: 1.8, fontSize: '1rem' }}>
                  {section.content}
                </p>
              )}
            </>
          )}
        </section>
      ))}
    </>
  )
}

// Client-side store that uses API routes to interact with SQLite database
// This is used in client components (browser-side)

import { Post, Category, LandingPageSection, LandingPageLink, LandingPageEvent, SocialMediaLink } from '@/types'

const API_BASE = '/api'

// POSTS
export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts`)
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function getPost(id: string): Promise<Post | undefined> {
  const res = await fetch(`${API_BASE}/posts/${id}`)
  if (!res.ok) return undefined
  return res.json()
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts()
  return posts.find(p => p.slug === slug)
}

export async function createPost(data: {
  title: string
  excerpt: string
  content: string
  category: string
  parentId?: string
  featuredImage?: string
}): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update post')
  return res.json()
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/posts/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete post')
}

export async function getSubpages(parentId: string): Promise<Post[]> {
  const posts = await getPosts()
  return posts
    .filter(p => p.parentId === parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
}

export async function getTopLevelPosts(): Promise<Post[]> {
  const posts = await getPosts()
  return posts.filter(p => !p.parentId)
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createCategory(data: { name: string; description: string }): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete category')
}

// KNOWLEDGE BASE
export async function searchKnowledgeBase(query: string, limit: number = 10) {
  const res = await fetch(`${API_BASE}/knowledge?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to search knowledge base')
  return res.json()
}

// LANDING PAGE
export async function getLandingSections(): Promise<LandingPageSection[]> {
  const res = await fetch(`${API_BASE}/landing/sections`)
  if (!res.ok) throw new Error('Failed to fetch landing sections')
  return res.json()
}

export async function getAllLandingSections(): Promise<LandingPageSection[]> {
  const res = await fetch(`${API_BASE}/landing/sections/all`)
  if (!res.ok) throw new Error('Failed to fetch all landing sections')
  return res.json()
}

export async function createLandingSection(data: Partial<LandingPageSection>): Promise<LandingPageSection> {
  const res = await fetch(`${API_BASE}/landing/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landing section')
  return res.json()
}

export async function updateLandingSection(id: string, data: Partial<LandingPageSection>): Promise<LandingPageSection> {
  const res = await fetch(`${API_BASE}/landing/sections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landing section')
  return res.json()
}

export async function deleteLandingSection(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/landing/sections/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete landing section')
}

export async function getLandingLinks(sectionId: string): Promise<LandingPageLink[]> {
  const res = await fetch(`${API_BASE}/landing/links?sectionId=${sectionId}`)
  if (!res.ok) throw new Error('Failed to fetch landing links')
  return res.json()
}

export async function createLandingLink(data: Partial<LandingPageLink>): Promise<LandingPageLink> {
  const res = await fetch(`${API_BASE}/landing/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landing link')
  return res.json()
}

export async function updateLandingLink(id: string, data: Partial<LandingPageLink>): Promise<LandingPageLink> {
  const res = await fetch(`${API_BASE}/landing/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landing link')
  return res.json()
}

export async function deleteLandingLink(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/landing/links/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete landing link')
}

export async function getLandingEvents(sectionId: string): Promise<LandingPageEvent[]> {
  const res = await fetch(`${API_BASE}/landing/events?sectionId=${sectionId}`)
  if (!res.ok) throw new Error('Failed to fetch landing events')
  return res.json()
}

export async function createLandingEvent(data: Partial<LandingPageEvent>): Promise<LandingPageEvent> {
  const res = await fetch(`${API_BASE}/landing/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landing event')
  return res.json()
}

export async function updateLandingEvent(id: string, data: Partial<LandingPageEvent>): Promise<LandingPageEvent> {
  const res = await fetch(`${API_BASE}/landing/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landing event')
  return res.json()
}

export async function deleteLandingEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/landing/events/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete landing event')
}

export async function getLandingSocial(sectionId: string): Promise<SocialMediaLink[]> {
  const res = await fetch(`${API_BASE}/landing/social?sectionId=${sectionId}`)
  if (!res.ok) throw new Error('Failed to fetch landing social')
  return res.json()
}

export async function createLandingSocial(data: Partial<SocialMediaLink>): Promise<SocialMediaLink> {
  const res = await fetch(`${API_BASE}/landing/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landing social')
  return res.json()
}

export async function updateLandingSocial(id: string, data: Partial<SocialMediaLink>): Promise<SocialMediaLink> {
  const res = await fetch(`${API_BASE}/landing/social/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landing social')
  return res.json()
}

export async function deleteLandingSocial(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/landing/social/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete landing social')
}

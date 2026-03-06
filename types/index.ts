export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // Markdown content
  category: string
  date: string
  readTime: number
  parentId?: string // For subpages
  order?: number // For ordering subpages
  featuredImage?: string // Image URL
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
}

export interface LandingPageSection {
  id: string
  type: 'hero' | 'text' | 'links' | 'events' | 'social' | 'image'
  title?: string
  content?: string
  order: number
  visible: boolean
  metadata?: Record<string, any> // For type-specific data (e.g., imageUrl, imageAlt)
}

export interface LandingPageLink {
  id: string
  sectionId: string
  label: string
  url: string
  icon?: string
  order: number
}

export interface LandingPageEvent {
  id: string
  sectionId: string
  title: string
  description?: string
  date: string
  url?: string
  order: number
}

export interface SocialMediaLink {
  id: string
  sectionId: string
  platform: string
  url: string
  icon?: string
  order: number
}

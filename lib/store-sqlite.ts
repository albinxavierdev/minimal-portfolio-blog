import db from './db'
import { Post, Category, LandingPageSection, LandingPageLink, LandingPageEvent, SocialMediaLink } from '@/types'
import { addToIndex, removeFromIndex } from './faiss-index'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

// POSTS
export function getPosts(): Post[] {
  const stmt = db.prepare('SELECT * FROM posts ORDER BY date DESC, createdAt DESC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content,
    category: row.category,
    date: row.date,
    readTime: row.readTime || 0,
    parentId: row.parentId || undefined,
    order: row.orderIndex || undefined,
    featuredImage: row.featuredImage || undefined,
  }))
}

export function getPost(id: string): Post | undefined {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?')
  const row = stmt.get(id) as any
  
  if (!row) return undefined
  
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content,
    category: row.category,
    date: row.date,
    readTime: row.readTime || 0,
    parentId: row.parentId || undefined,
    order: row.orderIndex || undefined,
    featuredImage: row.featuredImage || undefined,
  }
}

export function getPostBySlug(slug: string): Post | undefined {
  const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?')
  const row = stmt.get(slug) as any
  
  if (!row) return undefined
  
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content,
    category: row.category,
    date: row.date,
    readTime: row.readTime || 0,
    parentId: row.parentId || undefined,
    order: row.orderIndex || undefined,
    featuredImage: row.featuredImage || undefined,
  }
}

export function createPost(data: {
  title: string
  excerpt: string
  content: string
  category: string
  parentId?: string
  featuredImage?: string
  imageData?: Buffer
}): Post {
  const id = generateId()
  const slug = generateSlug(data.title)
  const date = new Date().toISOString().split('T')[0]
  const readTime = estimateReadTime(data.content)
  
  const stmt = db.prepare(`
    INSERT INTO posts (id, title, slug, excerpt, content, category, date, readTime, parentId, featuredImage, imageData, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `)
  
  stmt.run(
    id,
    data.title,
    slug,
    data.excerpt,
    data.content,
    data.category,
    date,
    readTime,
    data.parentId || null,
    data.featuredImage || null,
    data.imageData || null
  )
  
  // Auto-add to knowledge base for chatbot
  addToKnowledgeBase(id, data.title, data.content, 'post')
  
  // Auto-embed and add to FAISS index (async, don't block)
  addToIndex(id, 'post', data.title, data.content, data.excerpt).catch(err => {
    console.error('Failed to add to FAISS index:', err)
  })
  
  return getPost(id)!
}

export function updatePost(id: string, data: Partial<Post>): Post {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.title) {
    updates.push('title = ?')
    values.push(data.title)
    updates.push('slug = ?')
    values.push(generateSlug(data.title))
  }
  if (data.excerpt !== undefined) {
    updates.push('excerpt = ?')
    values.push(data.excerpt)
  }
  if (data.content) {
    updates.push('content = ?')
    values.push(data.content)
    updates.push('readTime = ?')
    values.push(estimateReadTime(data.content))
  }
  if (data.category) {
    updates.push('category = ?')
    values.push(data.category)
  }
  if (data.parentId !== undefined) {
    updates.push('parentId = ?')
    values.push(data.parentId || null)
  }
  if (data.featuredImage !== undefined) {
    updates.push('featuredImage = ?')
    values.push(data.featuredImage || null)
  }
  if (data.order !== undefined) {
    updates.push('orderIndex = ?')
    values.push(data.order)
  }
  
  updates.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(id)
  
  const stmt = db.prepare(`
    UPDATE posts SET ${updates.join(', ')} WHERE id = ?
  `)
  
  stmt.run(...values)
  
  // Update knowledge base
  const post = getPost(id)
  if (post) {
    updateKnowledgeBase(id, post.title, post.content)
    
    // Update FAISS index (async, don't block)
    addToIndex(id, 'post', post.title, post.content, post.excerpt).catch(err => {
      console.error('Failed to update FAISS index:', err)
    })
  }
  
  return getPost(id)!
}

export function deletePost(id: string): void {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?')
  stmt.run(id)
  
  // Also delete from knowledge base
  const kbStmt = db.prepare('DELETE FROM knowledge_base WHERE sourceId = ?')
  kbStmt.run(id)
  
  // Remove from FAISS index
  removeFromIndex(id)
}

export function getSubpages(parentId: string): Post[] {
  const stmt = db.prepare(`
    SELECT * FROM posts 
    WHERE parentId = ? 
    ORDER BY orderIndex ASC, date DESC
  `)
  const rows = stmt.all(parentId) as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content,
    category: row.category,
    date: row.date,
    readTime: row.readTime || 0,
    parentId: row.parentId || undefined,
    order: row.orderIndex || undefined,
    featuredImage: row.featuredImage || undefined,
  }))
}

export function getTopLevelPosts(): Post[] {
  const stmt = db.prepare(`
    SELECT * FROM posts 
    WHERE parentId IS NULL 
    ORDER BY date DESC
  `)
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content,
    category: row.category,
    date: row.date,
    readTime: row.readTime || 0,
    parentId: row.parentId || undefined,
    order: row.orderIndex || undefined,
    featuredImage: row.featuredImage || undefined,
  }))
}

// CATEGORIES
export function getCategories(): Category[] {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name ASC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
  }))
}

export function createCategory(data: { name: string; description: string }): Category {
  const id = generateId()
  const slug = generateSlug(data.name)
  
  const stmt = db.prepare(`
    INSERT INTO categories (id, name, slug, description)
    VALUES (?, ?, ?, ?)
  `)
  
  stmt.run(id, data.name, slug, data.description)
  
  return getCategories().find(c => c.id === id)!
}

export function deleteCategory(id: string): void {
  const stmt = db.prepare('DELETE FROM categories WHERE id = ?')
  stmt.run(id)
}

// KNOWLEDGE BASE (for chatbot)
export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  sourceType: string
  sourceId?: string
  tags?: string
  embedding?: string
  createdAt: string
  updatedAt: string
}

export function addToKnowledgeBase(
  sourceId: string,
  title: string,
  content: string,
  sourceType: string = 'post',
  tags?: string
): void {
  const id = generateId()
  const stmt = db.prepare(`
    INSERT INTO knowledge_base (id, title, content, sourceType, sourceId, tags)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(id, title, content, sourceType, sourceId, tags || null)
}

export function updateKnowledgeBase(
  sourceId: string,
  title: string,
  content: string
): void {
  const stmt = db.prepare(`
    UPDATE knowledge_base 
    SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE sourceId = ?
  `)
  
  stmt.run(title, content, sourceId)
}

export function searchKnowledgeBase(query: string, limit: number = 10): KnowledgeEntry[] {
  // Simple text search (can be enhanced with embeddings later)
  const stmt = db.prepare(`
    SELECT * FROM knowledge_base
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY updatedAt DESC
    LIMIT ?
  `)
  
  const searchTerm = `%${query}%`
  const rows = stmt.all(searchTerm, searchTerm, limit) as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    sourceType: row.sourceType,
    sourceId: row.sourceId || undefined,
    tags: row.tags || undefined,
    embedding: row.embedding || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export function getAllKnowledgeEntries(): KnowledgeEntry[] {
  const stmt = db.prepare('SELECT * FROM knowledge_base ORDER BY updatedAt DESC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    sourceType: row.sourceType,
    sourceId: row.sourceId || undefined,
    tags: row.tags || undefined,
    embedding: row.embedding || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

// IMAGE STORAGE
export function saveImage(postId: string, imageData: Buffer): void {
  const stmt = db.prepare('UPDATE posts SET imageData = ? WHERE id = ?')
  stmt.run(imageData, postId)
}

export function getImage(postId: string): Buffer | null {
  const stmt = db.prepare('SELECT imageData FROM posts WHERE id = ?')
  const row = stmt.get(postId) as any
  return row?.imageData || null
}

// LANDING PAGE
export function getLandingSections(): LandingPageSection[] {
  const stmt = db.prepare('SELECT * FROM landing_sections WHERE visible = 1 ORDER BY orderIndex ASC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    type: row.type as LandingPageSection['type'],
    title: row.title || undefined,
    content: row.content || undefined,
    order: row.orderIndex || 0,
    visible: row.visible === 1,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }))
}

export function getAllLandingSections(): LandingPageSection[] {
  const stmt = db.prepare('SELECT * FROM landing_sections ORDER BY orderIndex ASC')
  const rows = stmt.all() as any[]
  
  return rows.map(row => ({
    id: row.id,
    type: row.type as LandingPageSection['type'],
    title: row.title || undefined,
    content: row.content || undefined,
    order: row.orderIndex || 0,
    visible: row.visible === 1,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }))
}

export function getLandingSection(id: string): LandingPageSection | undefined {
  const stmt = db.prepare('SELECT * FROM landing_sections WHERE id = ?')
  const row = stmt.get(id) as any
  
  if (!row) return undefined
  
  return {
    id: row.id,
    type: row.type as LandingPageSection['type'],
    title: row.title || undefined,
    content: row.content || undefined,
    order: row.orderIndex || 0,
    visible: row.visible === 1,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }
}

export function createLandingSection(data: {
  type: LandingPageSection['type']
  title?: string
  content?: string
  order?: number
  visible?: boolean
  metadata?: Record<string, any>
}): LandingPageSection {
  const id = generateId()
  const stmt = db.prepare(`
    INSERT INTO landing_sections (id, type, title, content, orderIndex, visible, metadata, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `)
  
  stmt.run(
    id,
    data.type,
    data.title || null,
    data.content || null,
    data.order || 0,
    data.visible !== false ? 1 : 0,
    data.metadata ? JSON.stringify(data.metadata) : null
  )
  
  return getLandingSection(id)!
}

export function updateLandingSection(id: string, data: Partial<LandingPageSection>): LandingPageSection {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.type) {
    updates.push('type = ?')
    values.push(data.type)
  }
  if (data.title !== undefined) {
    updates.push('title = ?')
    values.push(data.title || null)
  }
  if (data.content !== undefined) {
    updates.push('content = ?')
    values.push(data.content || null)
  }
  if (data.order !== undefined) {
    updates.push('orderIndex = ?')
    values.push(data.order)
  }
  if (data.visible !== undefined) {
    updates.push('visible = ?')
    values.push(data.visible ? 1 : 0)
  }
  if (data.metadata !== undefined) {
    updates.push('metadata = ?')
    values.push(data.metadata ? JSON.stringify(data.metadata) : null)
  }
  
  updates.push('updatedAt = CURRENT_TIMESTAMP')
  values.push(id)
  
  const stmt = db.prepare(`UPDATE landing_sections SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  return getLandingSection(id)!
}

export function deleteLandingSection(id: string): void {
  const stmt = db.prepare('DELETE FROM landing_sections WHERE id = ?')
  stmt.run(id)
}

// LANDING PAGE LINKS
export function getLandingLinks(sectionId: string): LandingPageLink[] {
  const stmt = db.prepare('SELECT * FROM landing_links WHERE sectionId = ? ORDER BY orderIndex ASC')
  const rows = stmt.all(sectionId) as any[]
  
  return rows.map(row => ({
    id: row.id,
    sectionId: row.sectionId,
    label: row.label,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }))
}

export function createLandingLink(data: {
  sectionId: string
  label: string
  url: string
  icon?: string
  order?: number
}): LandingPageLink {
  const id = generateId()
  const stmt = db.prepare(`
    INSERT INTO landing_links (id, sectionId, label, url, icon, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(id, data.sectionId, data.label, data.url, data.icon || null, data.order || 0)
  
  const stmt2 = db.prepare('SELECT * FROM landing_links WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    label: row.label,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }
}

export function updateLandingLink(id: string, data: Partial<LandingPageLink>): LandingPageLink {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.label) {
    updates.push('label = ?')
    values.push(data.label)
  }
  if (data.url) {
    updates.push('url = ?')
    values.push(data.url)
  }
  if (data.icon !== undefined) {
    updates.push('icon = ?')
    values.push(data.icon || null)
  }
  if (data.order !== undefined) {
    updates.push('orderIndex = ?')
    values.push(data.order)
  }
  
  values.push(id)
  const stmt = db.prepare(`UPDATE landing_links SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  const stmt2 = db.prepare('SELECT * FROM landing_links WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    label: row.label,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }
}

export function deleteLandingLink(id: string): void {
  const stmt = db.prepare('DELETE FROM landing_links WHERE id = ?')
  stmt.run(id)
}

// LANDING PAGE EVENTS
export function getLandingEvents(sectionId: string): LandingPageEvent[] {
  const stmt = db.prepare('SELECT * FROM landing_events WHERE sectionId = ? ORDER BY orderIndex ASC, date DESC')
  const rows = stmt.all(sectionId) as any[]
  
  return rows.map(row => ({
    id: row.id,
    sectionId: row.sectionId,
    title: row.title,
    description: row.description || undefined,
    date: row.date,
    url: row.url || undefined,
    order: row.orderIndex || 0,
  }))
}

export function createLandingEvent(data: {
  sectionId: string
  title: string
  description?: string
  date: string
  url?: string
  order?: number
}): LandingPageEvent {
  const id = generateId()
  const stmt = db.prepare(`
    INSERT INTO landing_events (id, sectionId, title, description, date, url, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(id, data.sectionId, data.title, data.description || null, data.date, data.url || null, data.order || 0)
  
  const stmt2 = db.prepare('SELECT * FROM landing_events WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    title: row.title,
    description: row.description || undefined,
    date: row.date,
    url: row.url || undefined,
    order: row.orderIndex || 0,
  }
}

export function updateLandingEvent(id: string, data: Partial<LandingPageEvent>): LandingPageEvent {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.title) {
    updates.push('title = ?')
    values.push(data.title)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description || null)
  }
  if (data.date) {
    updates.push('date = ?')
    values.push(data.date)
  }
  if (data.url !== undefined) {
    updates.push('url = ?')
    values.push(data.url || null)
  }
  if (data.order !== undefined) {
    updates.push('orderIndex = ?')
    values.push(data.order)
  }
  
  values.push(id)
  const stmt = db.prepare(`UPDATE landing_events SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  const stmt2 = db.prepare('SELECT * FROM landing_events WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    title: row.title,
    description: row.description || undefined,
    date: row.date,
    url: row.url || undefined,
    order: row.orderIndex || 0,
  }
}

export function deleteLandingEvent(id: string): void {
  const stmt = db.prepare('DELETE FROM landing_events WHERE id = ?')
  stmt.run(id)
}

// SOCIAL MEDIA LINKS
export function getLandingSocial(sectionId: string): SocialMediaLink[] {
  const stmt = db.prepare('SELECT * FROM landing_social WHERE sectionId = ? ORDER BY orderIndex ASC')
  const rows = stmt.all(sectionId) as any[]
  
  return rows.map(row => ({
    id: row.id,
    sectionId: row.sectionId,
    platform: row.platform,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }))
}

export function createLandingSocial(data: {
  sectionId: string
  platform: string
  url: string
  icon?: string
  order?: number
}): SocialMediaLink {
  const id = generateId()
  const stmt = db.prepare(`
    INSERT INTO landing_social (id, sectionId, platform, url, icon, orderIndex)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  stmt.run(id, data.sectionId, data.platform, data.url, data.icon || null, data.order || 0)
  
  const stmt2 = db.prepare('SELECT * FROM landing_social WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    platform: row.platform,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }
}

export function updateLandingSocial(id: string, data: Partial<SocialMediaLink>): SocialMediaLink {
  const updates: string[] = []
  const values: any[] = []
  
  if (data.platform) {
    updates.push('platform = ?')
    values.push(data.platform)
  }
  if (data.url) {
    updates.push('url = ?')
    values.push(data.url)
  }
  if (data.icon !== undefined) {
    updates.push('icon = ?')
    values.push(data.icon || null)
  }
  if (data.order !== undefined) {
    updates.push('orderIndex = ?')
    values.push(data.order)
  }
  
  values.push(id)
  const stmt = db.prepare(`UPDATE landing_social SET ${updates.join(', ')} WHERE id = ?`)
  stmt.run(...values)
  
  const stmt2 = db.prepare('SELECT * FROM landing_social WHERE id = ?')
  const row = stmt2.get(id) as any
  
  return {
    id: row.id,
    sectionId: row.sectionId,
    platform: row.platform,
    url: row.url,
    icon: row.icon || undefined,
    order: row.orderIndex || 0,
  }
}

export function deleteLandingSocial(id: string): void {
  const stmt = db.prepare('DELETE FROM landing_social WHERE id = ?')
  stmt.run(id)
}

import Database from 'better-sqlite3'
import { Post, Category } from '@/types'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'blog.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database
const db = new Database(DB_PATH)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize schema
export function initDatabase() {
  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      readTime INTEGER DEFAULT 0,
      parentId TEXT,
      orderIndex INTEGER DEFAULT 0,
      featuredImage TEXT,
      imageData BLOB,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parentId) REFERENCES posts(id) ON DELETE CASCADE
    )
  `)

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Knowledge base table for chatbot
  db.exec(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sourceType TEXT DEFAULT 'post',
      sourceId TEXT,
      tags TEXT,
      embedding TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sourceId) REFERENCES posts(id) ON DELETE CASCADE
    )
  `)

  // Landing page sections
  db.exec(`
    CREATE TABLE IF NOT EXISTS landing_sections (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT,
      content TEXT,
      orderIndex INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1,
      metadata TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Landing page links
  db.exec(`
    CREATE TABLE IF NOT EXISTS landing_links (
      id TEXT PRIMARY KEY,
      sectionId TEXT NOT NULL,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sectionId) REFERENCES landing_sections(id) ON DELETE CASCADE
    )
  `)

  // Landing page events
  db.exec(`
    CREATE TABLE IF NOT EXISTS landing_events (
      id TEXT PRIMARY KEY,
      sectionId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      url TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sectionId) REFERENCES landing_sections(id) ON DELETE CASCADE
    )
  `)

  // Social media links
  db.exec(`
    CREATE TABLE IF NOT EXISTS landing_social (
      id TEXT PRIMARY KEY,
      sectionId TEXT NOT NULL,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sectionId) REFERENCES landing_sections(id) ON DELETE CASCADE
    )
  `)

  // Indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
    CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parentId);
    CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    CREATE INDEX IF NOT EXISTS idx_kb_source ON knowledge_base(sourceId);
    CREATE INDEX IF NOT EXISTS idx_kb_tags ON knowledge_base(tags);
    CREATE INDEX IF NOT EXISTS idx_landing_sections_order ON landing_sections(orderIndex);
    CREATE INDEX IF NOT EXISTS idx_landing_links_section ON landing_links(sectionId);
    CREATE INDEX IF NOT EXISTS idx_landing_events_section ON landing_events(sectionId);
    CREATE INDEX IF NOT EXISTS idx_landing_social_section ON landing_social(sectionId);
  `)

  // Insert default categories if they don't exist
  const defaultCategories = [
    { id: '1', name: 'essays', slug: 'essays', description: 'long-form thinking and ideas' },
    { id: '2', name: 'building', slug: 'building', description: 'what i\'m making and why' },
    { id: '3', name: 'notes', slug: 'notes', description: 'quick thoughts and observations' },
    { id: '4', name: 'reading', slug: 'reading', description: 'books, papers, and links' },
  ]

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, description)
    VALUES (?, ?, ?, ?)
  `)

  defaultCategories.forEach(cat => {
    insertCategory.run(cat.id, cat.name, cat.slug, cat.description)
  })

  // Insert default posts if they don't exist
  const defaultPosts = [
    {
      id: '1',
      title: 'why i started writing again',
      slug: 'why-i-started-writing-again',
      excerpt: 'after years of building things quietly, i realized writing was the missing piece.',
      content: `after years of building things quietly, i realized writing was the missing piece.

there's something about putting words on a page that forces clarity. you can hold a vague idea in your head for months — it feels solid, complete. but the moment you try to write it down, the gaps appear.

i used to think writing was for people with something to prove. some grand thesis. a book deal. but it's not. writing is just thinking, made visible. and visible thinking compounds.

so here we are. i'm going to write about what i'm building, what i'm reading, and what i'm figuring out. mostly for myself. but maybe it'll be useful to you too.`,
      category: 'essays',
      date: '2024-03-01',
      readTime: 3,
    },
    {
      id: '2',
      title: 'building in public is uncomfortable',
      slug: 'building-in-public-is-uncomfortable',
      excerpt: 'the fear of sharing work before it\'s ready is real. here\'s why i do it anyway.',
      content: `the fear of sharing work before it's ready is real. here's why i do it anyway.

every time i hit publish on something half-formed, there's a moment of pure dread. what if it's wrong? what if someone smarter points out the obvious flaw?

they will. and that's the point.

building in public is a forcing function. it compresses the feedback loop from months to days. the embarrassment of being wrong publicly is a small price for the compounding returns of learning faster.

the alternative — waiting until it's perfect — is just a different kind of failure. quiet, comfortable, and slow.`,
      category: 'building',
      date: '2024-02-20',
      readTime: 4,
    },
    {
      id: '3',
      title: 'a few things i noticed this week',
      slug: 'a-few-things-i-noticed-this-week',
      excerpt: 'small observations that didn\'t fit anywhere else but felt worth keeping.',
      content: `small observations that didn't fit anywhere else but felt worth keeping.

— the best tools disappear. you stop thinking about them and just do the thing.

— most decisions that feel huge are reversible. most decisions that feel small aren't.

— the person who reads the most in any room is rarely the loudest. they don't need to be.

— shipping something imperfect on tuesday beats shipping something perfect on friday.

— boredom is underrated. some of my best ideas came in the ten minutes i wasn't reaching for my phone.`,
      category: 'notes',
      date: '2024-02-10',
      readTime: 2,
    },
  ]

  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, category, date, readTime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  defaultPosts.forEach(post => {
    insertPost.run(
      post.id,
      post.title,
      post.slug,
      post.excerpt,
      post.content,
      post.category,
      post.date,
      post.readTime
    )
  })

  console.log('Database initialized successfully')
}

// Initialize on import
initDatabase()

export default db

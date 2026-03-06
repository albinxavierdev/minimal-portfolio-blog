# SQLite Database Setup

Your blog now uses **SQLite** as a local, lightweight SQL database instead of localStorage.

## Database Location

The database file is stored at:
```
/data/blog.db
```

This directory is automatically created on first run.

## Features

### 1. **Posts Table**
- Stores all blog posts
- Supports subpages (parent/child relationships)
- Can store images as BLOB or URLs
- Auto-calculates read time

### 2. **Categories Table**
- Manages blog categories
- Linked to posts

### 3. **Knowledge Base Table** (for Chatbot)
- Automatically syncs with blog posts
- Stores content for chatbot RAG (Retrieval Augmented Generation)
- Supports search queries
- Can store embeddings for semantic search

## Knowledge Base for Chatbot

Every blog post is automatically added to the knowledge base when created/updated. This makes it perfect for building a chatbot that can answer questions about your blog content.

### API Endpoints

#### Search Knowledge Base
```bash
GET /api/knowledge?q=your+query&limit=10
```

#### Get All Knowledge Entries
```bash
GET /api/knowledge
```

### Example: Using with a Chatbot

```typescript
// Search for relevant content
const response = await fetch('/api/knowledge?q=writing&limit=5')
const results = await response.json()

// Use results in your chatbot
results.forEach(entry => {
  console.log(entry.title)
  console.log(entry.content)
  console.log(entry.sourceId) // Link back to original post
})
```

### Adding Custom Knowledge Entries

You can add custom entries to the knowledge base (not from blog posts):

```typescript
import { addToKnowledgeBase } from '@/lib/store-sqlite'

addToKnowledgeBase(
  'custom-id',
  'Custom Title',
  'Custom content for chatbot...',
  'custom',
  'tag1, tag2'
)
```

## Image Storage

Images can be stored in two ways:

1. **URLs** (recommended): Store image URLs in `featuredImage` field
2. **BLOB**: Store binary data directly in database (use `imageData` field)

### Storing Image as BLOB

```typescript
import { saveImage } from '@/lib/store-sqlite'
import fs from 'fs'

const imageBuffer = fs.readFileSync('path/to/image.jpg')
saveImage(postId, imageBuffer)
```

### Retrieving Image

```typescript
import { getImage } from '@/lib/store-sqlite'

const imageData = getImage(postId)
// Use in API route to serve image
```

## Database Schema

### Posts
```sql
CREATE TABLE posts (
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
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Categories
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

### Knowledge Base
```sql
CREATE TABLE knowledge_base (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sourceType TEXT DEFAULT 'post',
  sourceId TEXT,
  tags TEXT,
  embedding TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## Backup

To backup your database:

```bash
# Copy the database file
cp data/blog.db data/blog.db.backup

# Or use SQLite backup command
sqlite3 data/blog.db ".backup data/blog.db.backup"
```

## Migration from localStorage

If you had data in localStorage, you can migrate it:

1. Export localStorage data (if needed)
2. The database initializes with default posts/categories
3. Your new posts will be stored in SQLite automatically

## Performance

SQLite is perfect for:
- ✅ Personal blogs (hundreds to thousands of posts)
- ✅ Local development
- ✅ Single-user applications
- ✅ Knowledge bases for chatbots

For production with high traffic, consider:
- PostgreSQL (via Supabase, Neon, etc.)
- MySQL (via PlanetScale)
- Or keep SQLite if traffic is low

## Next Steps for Chatbot Integration

1. **Add Embeddings**: Store vector embeddings in `embedding` field for semantic search
2. **Add RAG Pipeline**: Use knowledge base entries as context for LLM
3. **Add Search UI**: Create a search interface for users
4. **Add Chat Interface**: Build a chat UI that queries knowledge base

Example RAG flow:
```
User Question → Search Knowledge Base → Get Relevant Entries → 
Format as Context → Send to LLM → Return Answer with Sources
```

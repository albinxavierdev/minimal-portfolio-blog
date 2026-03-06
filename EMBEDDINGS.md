# Automatic Embedding Pipeline with Groq & FAISS

This blog automatically embeds all posts into a FAISS index for semantic search and chatbot RAG.

## Setup

### 1. Get Groq API Key

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key
3. Add to `.env` file:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 2. How It Works

**Automatic Pipeline:**
1. When a blog post is **created** → Automatically embedded and added to FAISS
2. When a blog post is **updated** → Embedding is regenerated and updated in FAISS
3. When a blog post is **deleted** → Removed from FAISS index

**No manual steps required!** The pipeline runs automatically in the background.

## Architecture

```
Blog Post Created/Updated
    ↓
Store in SQLite Database
    ↓
Add to Knowledge Base Table
    ↓
Generate Embedding (Groq API)
    ↓
Store in FAISS Index
    ↓
Ready for Semantic Search
```

## API Endpoints

### Search (Semantic Similarity)

```bash
GET /api/search?q=your+query&limit=5
```

**Response:**
```json
{
  "query": "your query",
  "results": [
    {
      "sourceId": "post-id",
      "title": "Post Title",
      "content": "Post content...",
      "score": 0.85
    }
  ],
  "count": 1
}
```

### Rebuild Index

If you need to rebuild the entire index (e.g., after migration):

```bash
POST /api/embeddings/rebuild
```

This will:
- Read all entries from knowledge_base table
- Generate embeddings for each
- Rebuild the FAISS index

## Usage in Chatbot

### Example: RAG with Chatbot

```typescript
// 1. User asks a question
const userQuestion = "What did you write about writing?"

// 2. Search FAISS index
const response = await fetch(`/api/search?q=${encodeURIComponent(userQuestion)}&limit=3`)
const { results } = await response.json()

// 3. Build context for LLM
const context = results
  .map(r => `Title: ${r.title}\nContent: ${r.content}`)
  .join('\n\n---\n\n')

// 4. Send to Groq LLM with context
const llmResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Answer questions based on this blog content:\n\n${context}`
      },
      {
        role: 'user',
        content: userQuestion
      }
    ]
  })
})

// 5. Return answer with sources
```

## File Structure

```
lib/
  ├── embeddings.ts      # Groq API integration
  ├── faiss-index.ts     # FAISS index management
  └── store-sqlite.ts    # Auto-triggers embeddings

app/api/
  ├── search/route.ts           # Semantic search endpoint
  └── embeddings/rebuild/route.ts  # Rebuild index endpoint
```

## Storage

- **FAISS Index**: Stored in `/data/faiss-metadata.json`
- **Embeddings in DB**: Also stored in `knowledge_base.embedding` column (JSON)

## Performance

- **Embedding Generation**: ~100-500ms per post (depends on Groq API)
- **Search**: <10ms (in-memory cosine similarity)
- **Index Size**: ~1-2KB per post (depends on embedding dimensions)

## Troubleshooting

### Embeddings not generating?

1. Check `GROQ_API_KEY` is set in `.env`
2. Check Groq API quota/limits
3. Check server logs for errors

### Search not working?

1. Rebuild index: `POST /api/embeddings/rebuild`
2. Check if embeddings exist in database
3. Verify FAISS index file exists

### Slow embedding generation?

- Groq API has rate limits
- Consider batching or queuing for large imports
- Embeddings are generated asynchronously (won't block post creation)

## Advanced: Custom Embedding Models

You can change the embedding model in `lib/embeddings.ts`:

```typescript
model: 'text-embedding-3-small'  // Current
// or
model: 'text-embedding-3-large'   // Higher quality, slower
```

## Next Steps

1. **Add Chatbot UI**: Create a chat interface that uses `/api/search`
2. **Add Streaming**: Stream LLM responses for better UX
3. **Add Caching**: Cache common queries
4. **Add Analytics**: Track search queries and results

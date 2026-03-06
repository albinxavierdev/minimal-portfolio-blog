import fs from 'fs'
import path from 'path'
import db from './db'
import { generateEmbedding, prepareTextForEmbedding } from './embeddings'

// FAISS index file path
const INDEX_PATH = path.join(process.cwd(), 'data', 'faiss.index')
const METADATA_PATH = path.join(process.cwd(), 'data', 'faiss-metadata.json')

interface IndexMetadata {
  id: string
  sourceId: string
  sourceType: string
  title: string
  content: string
  embedding: number[]
}

// In-memory index storage (for now - can be replaced with actual FAISS bindings)
let indexMetadata: IndexMetadata[] = []
let embeddings: number[][] = []

/**
 * Load FAISS index from disk
 */
export function loadIndex(): void {
  try {
    if (fs.existsSync(METADATA_PATH)) {
      const data = fs.readFileSync(METADATA_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      indexMetadata = parsed.metadata || []
      embeddings = parsed.embeddings || []
      console.log(`Loaded ${indexMetadata.length} embeddings from index`)
    }
  } catch (error) {
    console.error('Error loading index:', error)
    indexMetadata = []
    embeddings = []
  }
}

/**
 * Save FAISS index to disk
 */
export function saveIndex(): void {
  try {
    const dataDir = path.dirname(INDEX_PATH)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    fs.writeFileSync(
      METADATA_PATH,
      JSON.stringify({
        metadata: indexMetadata,
        embeddings: embeddings,
      }),
      'utf-8'
    )
    console.log(`Saved ${indexMetadata.length} embeddings to index`)
  } catch (error) {
    console.error('Error saving index:', error)
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Add or update embedding in the index
 */
export async function addToIndex(
  sourceId: string,
  sourceType: string,
  title: string,
  content: string,
  excerpt?: string
): Promise<void> {
  try {
    // Prepare text for embedding
    const text = prepareTextForEmbedding(title, content, excerpt)
    
    // Generate embedding using Groq
    const embedding = await generateEmbedding(text)
    
    // Check if entry already exists
    const existingIndex = indexMetadata.findIndex(m => m.sourceId === sourceId)
    
    const metadata: IndexMetadata = {
      id: existingIndex >= 0 ? indexMetadata[existingIndex].id : `${Date.now()}-${Math.random().toString(36)}`,
      sourceId,
      sourceType,
      title,
      content: text.substring(0, 2000), // Store truncated content
      embedding,
    }
    
    if (existingIndex >= 0) {
      // Update existing
      indexMetadata[existingIndex] = metadata
      embeddings[existingIndex] = embedding
    } else {
      // Add new
      indexMetadata.push(metadata)
      embeddings.push(embedding)
    }
    
    // Save to disk
    saveIndex()
    
    // Update database
    const embeddingStr = JSON.stringify(embedding)
    const stmt = db.prepare(`
      UPDATE knowledge_base 
      SET embedding = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE sourceId = ?
    `)
    stmt.run(embeddingStr, sourceId)
    
    console.log(`Added/updated embedding for ${sourceId}`)
  } catch (error) {
    console.error(`Error adding to index for ${sourceId}:`, error)
    throw error
  }
}

/**
 * Remove from index
 */
export function removeFromIndex(sourceId: string): void {
  const index = indexMetadata.findIndex(m => m.sourceId === sourceId)
  if (index >= 0) {
    indexMetadata.splice(index, 1)
    embeddings.splice(index, 1)
    saveIndex()
    console.log(`Removed embedding for ${sourceId}`)
  }
}

/**
 * Search for similar content using cosine similarity
 */
export async function searchIndex(
  query: string,
  limit: number = 5
): Promise<Array<{ sourceId: string; title: string; content: string; score: number }>> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query)
    
    // Calculate similarities
    const results = indexMetadata.map((metadata, index) => {
      const similarity = cosineSimilarity(queryEmbedding, embeddings[index])
      return {
        sourceId: metadata.sourceId,
        title: metadata.title,
        content: metadata.content,
        score: similarity,
      }
    })
    
    // Sort by score (highest first) and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(r => r.score > 0.1) // Minimum similarity threshold
  } catch (error) {
    console.error('Error searching index:', error)
    return []
  }
}

/**
 * Rebuild index from database (useful for initial setup or recovery)
 */
export async function rebuildIndex(): Promise<void> {
  console.log('Rebuilding FAISS index from database...')
  
  const stmt = db.prepare(`
    SELECT id, sourceId, sourceType, title, content 
    FROM knowledge_base
    ORDER BY createdAt DESC
  `)
  const entries = stmt.all() as any[]
  
  indexMetadata = []
  embeddings = []
  
  for (const entry of entries) {
    try {
      await addToIndex(
        entry.sourceId,
        entry.sourceType,
        entry.title,
        entry.content
      )
    } catch (error) {
      console.error(`Error processing entry ${entry.id}:`, error)
    }
  }
  
  console.log(`Rebuilt index with ${indexMetadata.length} entries`)
}

// Initialize index on import
loadIndex()

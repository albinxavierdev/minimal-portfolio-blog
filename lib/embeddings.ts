// Note: Groq doesn't support embeddings API directly
// Using simple text-based similarity (TF-IDF-like) instead
// For production with better semantic search, consider:
// - OpenAI embeddings API (text-embedding-3-small)
// - Cohere embeddings
// - Or use Groq's chat API to generate embeddings via prompts

/**
 * Generate a simple text-based "embedding" vector
 * This is a fallback when embeddings API is not available
 * Uses TF-IDF-like approach for basic similarity
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Simple text-based vectorization
  // Convert text to lowercase and create a frequency vector
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const wordFreq: Record<string, number> = {}
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  // Create a simple hash-based vector (128 dimensions)
  const vector = new Array(128).fill(0)
  const uniqueWords = Object.keys(wordFreq)
  
  uniqueWords.forEach((word, i) => {
    // Simple hash function
    let hash = 0
    for (let j = 0; j < word.length; j++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(j)
      hash = hash & hash
    }
    const index = Math.abs(hash) % 128
    vector[index] += wordFreq[word] / uniqueWords.length
  })
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    return vector.map(val => val / magnitude)
  }
  
  return vector
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(text => generateEmbedding(text)))
}

/**
 * Prepare text for embedding (combine title and content)
 */
export function prepareTextForEmbedding(title: string, content: string, excerpt?: string): string {
  // Combine title, excerpt, and content for better context
  const parts = [title]
  if (excerpt) parts.push(excerpt)
  parts.push(content)
  
  return parts.join('\n\n').substring(0, 8000) // Limit to reasonable length
}

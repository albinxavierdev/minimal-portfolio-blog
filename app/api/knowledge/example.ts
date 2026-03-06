/**
 * Example: Using Knowledge Base with a Chatbot
 * 
 * This shows how to integrate the knowledge base with a chatbot
 * for RAG (Retrieval Augmented Generation)
 */

import { searchKnowledgeBase, getAllKnowledgeEntries } from '@/lib/store-sqlite'

// Example 1: Simple search
export async function searchBlogContent(query: string) {
  const results = await searchKnowledgeBase(query, 5)
  
  return results.map(entry => ({
    title: entry.title,
    content: entry.content.substring(0, 500), // First 500 chars
    source: entry.sourceId,
    relevance: 'high', // You can add scoring logic
  }))
}

// Example 2: Build context for LLM
export async function buildContextForLLM(userQuestion: string) {
  // Search knowledge base
  const relevantEntries = await searchKnowledgeBase(userQuestion, 3)
  
  // Format as context
  const context = relevantEntries
    .map((entry, i) => `[${i + 1}] ${entry.title}\n${entry.content}`)
    .join('\n\n---\n\n')
  
  // Build prompt
  const prompt = `Based on the following blog content, answer the user's question.

Blog Content:
${context}

User Question: ${userQuestion}

Answer:`
  
  return prompt
}

// Example 3: Get all knowledge for embedding
export async function getAllKnowledgeForEmbedding() {
  const entries = await getAllKnowledgeEntries()
  
  return entries.map(entry => ({
    id: entry.id,
    text: `${entry.title}\n\n${entry.content}`,
    metadata: {
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      tags: entry.tags,
    },
  }))
}

// Example 4: Chatbot response with sources
export async function chatbotResponse(question: string) {
  // 1. Search knowledge base
  const results = await searchKnowledgeBase(question, 3)
  
  // 2. Build context
  const context = results
    .map(r => `Title: ${r.title}\nContent: ${r.content}`)
    .join('\n\n---\n\n')
  
  // 3. Call your LLM (OpenAI, Anthropic, etc.)
  // const response = await callLLM(context, question)
  
  // 4. Return with sources
  return {
    answer: '...', // LLM response
    sources: results.map(r => ({
      title: r.title,
      postId: r.sourceId,
      excerpt: r.content.substring(0, 200),
    })),
  }
}

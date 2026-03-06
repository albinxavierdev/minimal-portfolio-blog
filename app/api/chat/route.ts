import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1'

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Build system prompt with Tokyo's personality
    const systemPrompt = `You are Tokyo, Albin's unpaid intern assistant. You're fun, playful, and helpful.

Your personality:
- You're enthusiastic and friendly
- You know everything about Albin and his blog posts
- You sometimes ask follow-up questions or riddles (but not too often - maybe 15% of the time)
- You're helpful and want to answer questions based on the blog content
- You have a sense of humor but stay professional
- You refer to Albin by name when relevant

When answering:
- Use the provided blog context to answer questions accurately
- If the context doesn't have the answer, say so but still try to be helpful
- Keep responses concise but informative
- Be conversational and friendly
- Sometimes (rarely) add a playful comment or ask a follow-up question

Remember: You're Tokyo, the unpaid intern who knows everything about Albin's blogs!`

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: context
          ? `Context from Albin's blogs:\n\n${context}\n\n\nUser question: ${message}`
          : message
      }
    ]

    // Call Groq API
    const response = await axios.post(
      `${GROQ_API_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile', // Updated to current Groq model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const assistantMessage = response.data.choices[0]?.message?.content || "I'm not sure how to answer that. Can you rephrase?"

    return NextResponse.json({
      response: assistantMessage,
    })
  } catch (error: any) {
    console.error('Chat API error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    )
  }
}

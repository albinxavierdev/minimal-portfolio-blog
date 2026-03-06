'use client'

import { useState, useRef, useEffect } from 'react'
import TokyoCharacter from './TokyoCharacter'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ title: string; sourceId: string }>
}

const PLAYFUL_RESPONSES = [
  "Hmm, let me think... 🤔",
  "Ooh, interesting question! Let me dig into Albin's brain... 🧠",
  "Hold on, I'm checking my notes... 📝",
  "Let me ask Albin's blog posts about that... 📚",
]

const RIDDLES = [
  {
    riddle: "I'm always running but never get tired. What am I?",
    answer: "A river! 🌊"
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "Footsteps! 👣"
  },
  {
    riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answer: "A map! 🗺️"
  }
]

const FOLLOW_UP_QUESTIONS = [
  "Want to know more about that?",
  "Should I dig deeper into that topic?",
  "Want me to find more related posts?",
  "Curious about something else?",
]

export default function TokyoChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey! I'm Tokyo, Albin's unpaid intern! 👋 I know everything about Albin and his blogs. Ask me anything! (And sometimes I might ask you a riddle... just for fun! 😄)"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'thinking' | 'excited' | 'confused'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const shouldBePlayful = () => {
    // 15% chance of being playful
    return Math.random() < 0.15
  }

  const getPlayfulResponse = () => {
    const random = Math.random()
    if (random < 0.3) {
      // Ask a riddle
      const riddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)]
      return {
        type: 'riddle' as const,
        content: `Before I answer, can you solve this riddle? 🤔\n\n${riddle.riddle}\n\n(Reply with your answer, or just say "skip" to get my answer!)`,
        riddleAnswer: riddle.answer
      }
    } else if (random < 0.6) {
      // Ask follow-up
      const question = FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]
      return {
        type: 'followup' as const,
        content: question
      }
    } else {
      // Playful intro
      const intro = PLAYFUL_RESPONSES[Math.floor(Math.random() * PLAYFUL_RESPONSES.length)]
      return {
        type: 'playful' as const,
        content: intro
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setMood('thinking')

    try {
      // Check if it's a riddle answer
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.content.includes('riddle') && input.toLowerCase().includes('skip')) {
        const riddleAnswer = lastMessage.content.match(/answer: (.+)/)?.[1] || "Nice try! 😄"
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: riddleAnswer
        }])
        setLoading(false)
        return
      }

      // Search knowledge base for RAG
      const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(input)}&limit=3`)
      const searchData = await searchResponse.json()
      const context = searchData.results || []

      // Build context for LLM
      const contextText = context.length > 0
        ? context.map((r: any, i: number) => `[${i + 1}] ${r.title}\n${r.content}`).join('\n\n---\n\n')
        : "No specific blog content found, but I can still help based on what I know about Albin!"

      // Call chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: contextText,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const chatData = await chatResponse.json()

      // Add playful element sometimes
      let assistantContent = chatData.response || "Hmm, I'm not sure about that. Want to ask something else?"
      let sources = context.map((r: any) => ({ title: r.title, sourceId: r.sourceId }))

      if (shouldBePlayful() && !input.toLowerCase().includes('riddle')) {
        const playful = getPlayfulResponse()
        if (playful.type === 'riddle') {
          assistantContent = `${assistantContent}\n\n---\n\n${playful.content}`
        } else if (playful.type === 'followup') {
          assistantContent = `${assistantContent}\n\n${playful.content}`
        } else {
          assistantContent = `${playful.content}\n\n${assistantContent}`
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantContent,
        sources: sources.length > 0 ? sources : undefined
      }])
      
      // Set mood based on response
      if (context.length > 0) {
        setMood('happy')
        setTimeout(() => setMood('idle'), 2000)
      } else {
        setMood('confused')
        setTimeout(() => setMood('idle'), 2000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Oops! Something went wrong. Albin probably forgot to pay me... 😅 Try again?"
      }])
      setMood('confused')
      setTimeout(() => setMood('idle'), 2000)
    } finally {
      setLoading(false)
      if (mood === 'thinking') {
        setMood('idle')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chatbot Icon/Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="tokyo-icon"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'var(--text)',
            zIndex: 1000,
            transition: 'all 0.2s ease',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--hover)'
            e.currentTarget.style.borderColor = 'var(--text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`tokyo-chat ${isFullscreen ? 'fullscreen' : ''}`}
          style={{
            position: 'fixed',
            bottom: isFullscreen ? 0 : 24,
            right: isFullscreen ? 0 : 24,
            width: isFullscreen ? '100vw' : 420,
            height: isFullscreen ? '100vh' : 600,
            maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 48px)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: isFullscreen ? 0 : 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            animation: 'slideUp 0.3s ease',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <div>
                <div style={{ 
                  fontFamily: 'Lora, Georgia, serif',
                  fontWeight: 400, 
                  fontSize: '1.1rem',
                  color: 'var(--text)',
                  lineHeight: 1.2,
                }}>
                  Tokyo
                </div>
                <div style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--muted)',
                  letterSpacing: '0.04em',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 300,
                }}>
                  albin's unpaid intern
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: '0.82rem',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 300,
                  padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                {isFullscreen ? 'restore' : 'fullscreen'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  fontSize: '0.82rem',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 300,
                  padding: '4px 8px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                close
              </button>
            </div>
          </div>

          {/* Content Area - Character + Messages */}
          <div style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
          }}>
            {/* Tokyo Character - Only in fullscreen */}
            {isFullscreen && (
              <div style={{
                width: 280,
                borderRight: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--hover)',
              }}>
                <TokyoCharacter
                  isThinking={loading}
                  isTalking={!loading && messages.length > 1}
                  mood={mood}
                />
              </div>
            )}

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '14px 18px',
                    borderRadius: 0,
                    background: msg.role === 'user'
                      ? 'var(--text)'
                      : 'var(--hover)',
                    color: msg.role === 'user' ? 'var(--bg)' : 'var(--text)',
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 300,
                  }}
                >
                  {msg.content}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--muted)',
                    marginTop: 6,
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 300,
                    letterSpacing: '0.02em',
                  }}>
                    sources: {msg.sources.map(s => s.title).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--muted)',
                fontSize: '0.9rem',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 300,
              }}>
                <span>tokyo is thinking</span>
                <span style={{ animation: 'dots 1.5s infinite' }}>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 12,
            background: 'var(--bg)',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ask tokyo anything about albin or the blogs..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.95rem',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 300,
                background: 'transparent',
                color: 'var(--text)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderBottomColor = 'var(--text)'
              }}
              onBlur={(e) => {
                e.target.style.borderBottomColor = 'var(--border)'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 24px',
                background: loading || !input.trim()
                  ? 'transparent'
                  : 'var(--text)',
                color: loading || !input.trim()
                  ? 'var(--muted)'
                  : 'var(--bg)',
                border: 'none',
                borderRadius: 0,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.88rem',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 300,
                transition: 'all 0.15s',
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              send →
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes dots {
          0%, 20% { opacity: 0.3; }
          40% { opacity: 0.6; }
          60%, 100% { opacity: 1; }
        }
      `}</style>
    </>
  )
}

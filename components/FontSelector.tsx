'use client'

import { useState, useEffect } from 'react'

const FONTS = [
  { id: 'default', name: 'DM Sans', family: 'DM Sans, sans-serif' },
  { id: 'inter', name: 'Inter', family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' },
  { id: 'system', name: 'System', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans, sans-serif' },
  { id: 'lora', name: 'Lora', family: 'Lora, Georgia, serif' },
  { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, Georgia, serif' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, Georgia, serif' },
]

export default function FontSelector() {
  const [selectedFont, setSelectedFont] = useState<string>('default')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved font preference
    const saved = localStorage.getItem('app-font')
    if (saved) {
      setSelectedFont(saved)
      applyFont(saved)
    }
  }, [])

  const applyFont = (fontId: string) => {
    const body = document.body
    // Remove all font classes
    FONTS.forEach(f => {
      body.classList.remove(`font-${f.id}`)
    })
    
    if (fontId !== 'default') {
      body.classList.add(`font-${fontId}`)
    }
    
    // Update CSS variable
    const font = FONTS.find(f => f.id === fontId) || FONTS[0]
    document.documentElement.style.setProperty('--font-sans', font.family)
  }

  const handleFontChange = (fontId: string) => {
    setSelectedFont(fontId)
    applyFont(fontId)
    localStorage.setItem('app-font', fontId)
    setIsOpen(false)
  }

  const currentFont = FONTS.find(f => f.id === selectedFont) || FONTS[0]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '0.72rem',
          color: 'var(--muted)',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        font: {currentFont.name} {isOpen ? '▲' : '▼'}
      </button>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: 8,
            minWidth: 180,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          {FONTS.map(font => (
            <button
              key={font.id}
              onClick={() => handleFontChange(font.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: selectedFont === font.id ? 'var(--hover)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: font.family,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

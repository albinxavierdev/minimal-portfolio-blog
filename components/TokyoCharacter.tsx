'use client'

import { useState, useEffect, useRef } from 'react'

interface TokyoCharacterProps {
  isThinking: boolean
  isTalking: boolean
  mood: 'idle' | 'happy' | 'thinking' | 'excited' | 'confused'
}

// Sprite data from sprite.html
const PALETTE = ["#170a22","#324a86","#373b5c","#39415f","#502931","#513852","#524d62","#6b708b","#8e7998","#9b384e","#9e5961","#a28e9d","#b69479","#bcaac2","#c86672","#ce7986","#d4bdc5","#dca0a3","#e9d2cd","#f7d5b8"];

const PIXELS = [
  [2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,2,2,3,2,3,2,2,2,2,3,3,3,3,2,2,3,3,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,3,3,3,3,2,2,2,2,2,2,2,3,2,2,0,0,2,2,2,0,0,0,0,0,0,0,3,3,3,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,2,2,3,6,6,6,3,2,2,2,2,2,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,2,2,2,2,2,2,2,2,2,2],
  [2,2,2,2,3,3,2,5,10,10,0,3,2,2,2,2,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,2,3,2,3,2,3,2],
  [2,2,2,2,3,2,15,9,9,9,5,0,3,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,0,0,0,0,3,3],
  [2,2,2,2,3,6,8,5,0,4,9,5,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,3,2,3,5,0,10,9,0,3,2,2,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,3,9,4,0,3,2,2,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,2,2,2,2,2,2,3,0,0,2,2,5,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [2,2,2,2,2,2,3,2,0,0,2,3,3,3,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [3,6,6,2,2,2,2,3,0,0,2,3,2,3,0,0,0,0,0,0,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [6,6,7,6,6,3,6,2,2,3,3,2,2,2,0,0,0,0,0,0,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  [6,7,7,7,7,7,7,2,2,2,2,2,3,2,0,0,0,0,0,11,18,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  [6,7,7,7,7,7,7,7,7,2,2,2,2,2,0,0,0,0,0,19,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [6,7,7,7,7,7,7,7,7,7,2,2,2,0,0,0,0,0,17,19,19,19,19,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [6,7,7,7,7,7,7,7,7,7,7,2,2,0,0,0,0,0,17,18,19,19,19,19,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [6,7,7,7,7,7,7,7,7,7,7,2,3,0,0,0,0,0,0,0,6,17,19,19,19,17,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [6,7,7,7,7,7,7,7,7,7,7,2,3,0,0,0,0,11,11,18,5,0,11,18,19,19,18,17,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [6,6,7,7,7,7,7,7,7,7,7,2,3,0,0,0,0,11,18,0,0,4,6,18,19,19,0,0,0,11,11,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,7,7,7,7,7,7,7,7,7,2,2,0,0,0,0,17,17,18,0,11,18,19,19,19,11,18,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  [2,2,2,7,7,7,7,7,7,7,7,2,2,2,0,0,0,17,19,18,18,18,19,19,19,19,18,18,5,0,18,11,0,0,0,0,0,0,0,6,0,0,0,0,0],
  [2,2,3,7,7,7,7,7,7,7,2,2,2,2,0,0,0,18,19,19,19,18,17,18,19,19,19,6,11,11,11,0,0,0,0,0,0,0,2,3,0,0,0,0,0],
  [2,2,2,7,7,7,7,7,7,2,2,2,2,2,0,0,0,0,18,19,19,19,19,19,19,19,19,18,18,17,17,0,0,0,0,0,0,0,2,2,0,0,0,0,6],
  [2,2,6,7,7,7,7,7,3,2,3,2,2,2,0,0,0,0,18,19,19,19,19,19,19,19,19,19,18,18,11,0,0,0,0,0,0,6,2,2,0,0,0,0,0],
  [2,2,7,7,7,7,7,6,2,2,3,2,2,2,0,0,0,0,0,18,19,19,19,18,19,19,19,18,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0],
  [2,2,7,7,7,7,7,6,2,2,0,18,0,6,0,0,11,0,0,0,19,18,18,19,19,19,19,19,17,0,0,0,0,0,0,0,3,2,3,2,0,0,0,0,0],
  [2,2,7,7,7,7,7,7,3,3,18,10,14,17,10,17,0,0,0,0,4,19,18,18,19,18,17,9,10,6,3,2,0,0,0,3,3,2,2,2,0,0,0,0,0],
  [2,2,7,7,7,7,7,7,6,11,17,17,17,15,10,0,0,0,0,0,0,0,3,0,6,6,10,10,10,0,3,2,0,0,0,2,2,2,3,0,0,0,0,0,0],
  [2,2,7,7,7,7,6,8,18,18,17,0,6,17,15,0,0,0,0,0,0,0,0,0,0,0,4,4,18,0,0,0,0,0,0,2,3,2,2,0,0,0,0,0,0],
  [2,2,2,6,7,7,6,18,17,11,10,2,0,17,17,4,0,0,0,0,6,18,11,0,0,0,6,18,18,7,2,0,0,0,2,2,2,3,2,0,0,0,0,0,0],
  [2,2,2,2,2,6,19,12,17,17,10,0,18,17,4,0,0,0,0,0,16,16,0,0,18,18,16,16,11,2,0,0,0,0,2,2,3,2,0,0,0,0,0,0,0],
  [2,2,2,2,3,0,19,19,19,10,17,4,17,0,2,3,0,0,0,0,11,2,0,0,18,17,16,16,2,2,0,0,0,2,3,2,2,0,0,0,0,0,0,0,0],
  [2,2,2,3,0,19,19,10,10,17,10,17,17,2,2,6,0,0,0,18,7,2,0,0,0,18,18,2,2,2,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0],
  [2,2,2,3,4,18,17,10,17,17,14,17,2,3,6,11,0,0,0,17,7,0,11,16,0,16,0,7,8,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6],
  [2,2,2,0,18,19,17,17,14,17,8,2,2,2,11,11,0,0,18,16,5,17,18,16,18,0,8,8,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  [2,2,3,0,18,19,17,17,17,4,3,3,6,6,11,5,0,0,18,16,16,16,18,16,16,18,16,8,0,0,0,0,0,0,18,6,0,0,0,0,0,0,0,0,0],
  [2,2,2,6,19,17,17,17,0,2,3,6,18,7,7,0,0,0,0,0,16,16,16,16,16,18,11,2,0,0,0,0,0,18,17,16,11,0,0,0,0,0,2,0,0],
  [2,3,0,6,11,17,8,0,7,2,2,0,8,7,0,0,0,0,0,0,7,7,18,18,18,16,7,0,0,0,0,0,17,18,16,18,16,6,0,0,0,6,3,0,0],
  [2,3,0,16,16,18,16,11,7,2,3,0,11,0,0,0,17,17,0,0,0,0,0,8,8,8,0,0,0,0,0,17,16,16,16,18,16,16,11,0,0,2,2,5,0],
  [2,3,0,16,18,18,8,7,2,2,2,0,2,0,0,0,6,4,0,0,0,0,0,0,0,0,0,0,0,0,11,18,16,16,16,18,16,16,7,11,0,2,2,5,0],
  [2,3,0,16,18,16,8,8,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,16,16,16,16,18,16,16,8,11,0,2,2,6,0],
  [2,3,0,18,11,8,6,2,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,16,16,16,16,16,16,8,8,0,0,0,2,2,0],
  [2,2,6,0,5,0,2,2,2,1,3,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,16,16,16,16,18,16,16,8,6,2,2,0,0,0,0],
  [2,2,2,2,16,7,5,2,2,7,3,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,18,17,16,16,18,16,11,8,2,3,2,2,2,0,0],
  [2,2,2,2,18,13,2,2,2,3,2,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,18,18,16,8,8,7,2,2,0,2,2,0,0,6]
];

const W = 45;
const H = 45;

export default function TokyoCharacter({ isThinking, isTalking, mood }: TokyoCharacterProps) {
  const [currentMood, setCurrentMood] = useState<'idle' | 'happy' | 'thinking' | 'excited' | 'confused'>(mood)
  const [frame, setFrame] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isThinking) {
      setCurrentMood('thinking')
    } else if (isTalking) {
      setCurrentMood('excited')
    } else {
      setCurrentMood(mood)
    }
  }, [isThinking, isTalking, mood])

  // Animation frame
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  // Create modified sprite based on mood
  // Analyzing the sprite: face appears to be in the center-left area
  // Looking at rows 12-18, columns 18-26 for facial features
  const getModifiedPixels = (): number[][] => {
    // Deep copy the base sprite
    const modified = PIXELS.map(row => [...row])
    
    // Based on sprite analysis, the face area is approximately:
    // Eyes: rows 12-13, columns 19-22 (left) and 23-26 (right)
    // Mouth: rows 15-16, columns 20-25
    
    switch (currentMood) {
      case 'happy':
      case 'excited':
        // Happy/excited - bright eyes with highlights, upward curved smile
        // Left eye area (row 12-13, columns 19-21)
        if (modified[12][19] !== undefined) modified[12][19] = 19 // Bright highlight
        if (modified[12][20] !== undefined) modified[12][20] = 18
        if (modified[12][21] !== undefined) modified[12][21] = 19
        if (modified[13][19] !== undefined) modified[13][19] = 18
        if (modified[13][20] !== undefined) modified[13][20] = 19
        if (modified[13][21] !== undefined) modified[13][21] = 18
        // Right eye area (row 12-13, columns 23-25)
        if (modified[12][23] !== undefined) modified[12][23] = 19
        if (modified[12][24] !== undefined) modified[12][24] = 18
        if (modified[12][25] !== undefined) modified[12][25] = 19
        if (modified[13][23] !== undefined) modified[13][23] = 18
        if (modified[13][24] !== undefined) modified[13][24] = 19
        if (modified[13][25] !== undefined) modified[13][25] = 18
        // Smile - curved upward (rows 15-16, columns 20-24)
        if (modified[15][20] !== undefined) modified[15][20] = 19
        if (modified[15][21] !== undefined) modified[15][21] = 18
        if (modified[15][22] !== undefined) modified[15][22] = 19
        if (modified[15][23] !== undefined) modified[15][23] = 18
        if (modified[15][24] !== undefined) modified[15][24] = 19
        if (modified[16][19] !== undefined) modified[16][19] = 18
        if (modified[16][20] !== undefined) modified[16][20] = 19
        if (modified[16][24] !== undefined) modified[16][24] = 19
        if (modified[16][25] !== undefined) modified[16][25] = 18
        break
        
      case 'thinking':
        // Thinking - squinted/closed eyes, neutral mouth
        // Squint left eye (make darker/narrower)
        if (modified[12][19] !== undefined) modified[12][19] = 11
        if (modified[12][20] !== undefined) modified[12][20] = 11
        if (modified[12][21] !== undefined) modified[12][21] = 11
        if (modified[13][19] !== undefined) modified[13][19] = 11
        if (modified[13][20] !== undefined) modified[13][20] = 11
        if (modified[13][21] !== undefined) modified[13][21] = 11
        // Squint right eye
        if (modified[12][23] !== undefined) modified[12][23] = 11
        if (modified[12][24] !== undefined) modified[12][24] = 11
        if (modified[12][25] !== undefined) modified[12][25] = 11
        if (modified[13][23] !== undefined) modified[13][23] = 11
        if (modified[13][24] !== undefined) modified[13][24] = 11
        if (modified[13][25] !== undefined) modified[13][25] = 11
        // Neutral mouth
        if (modified[15][21] !== undefined) modified[15][21] = 11
        if (modified[15][22] !== undefined) modified[15][22] = 11
        if (modified[15][23] !== undefined) modified[15][23] = 11
        break
        
      case 'confused':
        // Confused - wide open eyes, small mouth
        // Wide eyes with open centers
        if (modified[12][19] !== undefined) modified[12][19] = 0 // Open
        if (modified[12][20] !== undefined) modified[12][20] = 19 // Outline
        if (modified[12][21] !== undefined) modified[12][21] = 0 // Open
        if (modified[12][23] !== undefined) modified[12][23] = 0 // Open
        if (modified[12][24] !== undefined) modified[12][24] = 19 // Outline
        if (modified[12][25] !== undefined) modified[12][25] = 0 // Open
        if (modified[13][19] !== undefined) modified[13][19] = 19
        if (modified[13][20] !== undefined) modified[13][20] = 0
        if (modified[13][21] !== undefined) modified[13][21] = 19
        if (modified[13][23] !== undefined) modified[13][23] = 19
        if (modified[13][24] !== undefined) modified[13][24] = 0
        if (modified[13][25] !== undefined) modified[13][25] = 19
        // Small confused mouth
        if (modified[15][21] !== undefined) modified[15][21] = 19
        if (modified[15][22] !== undefined) modified[15][22] = 19
        if (modified[16][20] !== undefined) modified[16][20] = 19
        if (modified[16][23] !== undefined) modified[16][23] = 19
        break
        
      case 'idle':
      default:
        // Idle - keep original sprite, no modifications
        break
    }
    
    return modified
  }

  // Draw sprite on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scale = 4 // Scale factor for rendering
    canvas.width = W * scale
    canvas.height = H * scale
    ctx.imageSmoothingEnabled = false

    // Get mood-modified pixels
    const pixels = getModifiedPixels()

    // Draw the sprite
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const colorIndex = pixels[y][x]
        if (colorIndex !== undefined && colorIndex < PALETTE.length) {
          ctx.fillStyle = PALETTE[colorIndex]
          ctx.fillRect(x * scale, y * scale, scale, scale)
        }
      }
    }

    // Add blinking animation for idle mood
    if (currentMood === 'idle' && frame % 8 < 2) {
      // Blink - draw a line over the eyes
      ctx.fillStyle = PALETTE[11] // Use a darker color for closed eyes
      // Left eye blink (row 12, columns 19-21)
      ctx.fillRect(19 * scale, 12 * scale, 3 * scale, 1 * scale)
      // Right eye blink (row 12, columns 23-25)
      ctx.fillRect(23 * scale, 12 * scale, 3 * scale, 1 * scale)
    }
  }, [currentMood, frame])

  const getCharacterStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }

    switch (currentMood) {
      case 'thinking':
        return { ...baseStyle, animation: 'blink 1.5s infinite, pulse 2s infinite' }
      case 'excited':
        return { ...baseStyle, animation: 'bounce 0.6s infinite' }
      case 'happy':
        return { ...baseStyle, animation: 'wiggle 1.2s infinite' }
      case 'confused':
        return { ...baseStyle, animation: 'tilt 1.8s infinite' }
      default:
        return { ...baseStyle, animation: 'idle 4s infinite' }
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 0,
      minWidth: 200,
      minHeight: 300,
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Character Canvas */}
      <div style={getCharacterStyle()}>
        <canvas
          ref={canvasRef}
          style={{
            imageRendering: 'pixelated',
            imageRendering: '-moz-crisp-edges',
            imageRendering: 'crisp-edges',
            display: 'block',
          }}
        />
      </div>

      {/* Status text */}
      <div style={{
        marginTop: 24,
        fontSize: '0.72rem',
        color: 'var(--muted)',
        textAlign: 'center',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 300,
        letterSpacing: '0.04em',
        textTransform: 'lowercase',
      }}>
        {currentMood === 'thinking' && 'processing...'}
        {currentMood === 'excited' && 'responding...'}
        {currentMood === 'happy' && 'ready'}
        {currentMood === 'confused' && 'analyzing...'}
        {currentMood === 'idle' && 'standby'}
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
        
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes idle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}

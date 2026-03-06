'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Custom components for rendering
const components = {
  // Headings
  h1: ({ node, ...props }: any) => (
    <h1 style={{
      fontFamily: 'Lora, Georgia, serif',
      fontWeight: 500,
      fontSize: '2rem',
      lineHeight: 1.3,
      marginTop: '2em',
      marginBottom: '1em',
      letterSpacing: '-0.01em',
    }} {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 style={{
      fontFamily: 'Lora, Georgia, serif',
      fontWeight: 500,
      fontSize: '1.6rem',
      lineHeight: 1.3,
      marginTop: '1.8em',
      marginBottom: '0.8em',
      letterSpacing: '-0.01em',
    }} {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 style={{
      fontFamily: 'Lora, Georgia, serif',
      fontWeight: 400,
      fontSize: '1.3rem',
      lineHeight: 1.4,
      marginTop: '1.5em',
      marginBottom: '0.6em',
    }} {...props} />
  ),
  
  // Paragraphs
  p: ({ node, children, ...props }: any) => {
    // Check if paragraph contains only a link to YouTube
    const childrenStr = Array.isArray(children) 
      ? children.map((c: any) => (typeof c === 'string' ? c : (c?.props?.href || ''))).join('')
      : String(children || '')
    
    // Check if it's a YouTube link
    if (childrenStr.includes('youtube.com') || childrenStr.includes('youtu.be')) {
      const youtubeId = getYouTubeId(childrenStr)
      if (youtubeId) {
        return (
          <div style={{ margin: '2em 0', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: 4,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }
    
    return <p style={{ marginBottom: '1.4em', lineHeight: 1.85 }} {...props}>{children}</p>
  },
  
  // Lists
  ul: ({ node, ...props }: any) => (
    <ul style={{
      marginBottom: '1.4em',
      paddingLeft: '1.5em',
      listStyleType: 'disc',
    }} {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol style={{
      marginBottom: '1.4em',
      paddingLeft: '1.5em',
      listStyleType: 'decimal',
    }} {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li style={{
      marginBottom: '0.5em',
      lineHeight: 1.7,
    }} {...props} />
  ),
  
  // Code blocks
  code: ({ node, inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code style={{
          background: 'var(--hover)',
          padding: '2px 6px',
          borderRadius: 3,
          fontSize: '0.9em',
          fontFamily: 'Monaco, "Courier New", monospace',
        }} {...props}>
          {children}
        </code>
      )
    }
    return (
      <pre style={{
        background: '#1a1a1a',
        color: '#f8f8f2',
        padding: '1.2em',
        borderRadius: 6,
        overflow: 'auto',
        margin: '1.5em 0',
        fontSize: '0.9rem',
        lineHeight: 1.6,
        fontFamily: 'Monaco, "Courier New", monospace',
      }}>
        <code {...props}>{children}</code>
      </pre>
    )
  },
  
  // Blockquotes
  blockquote: ({ node, ...props }: any) => (
    <blockquote style={{
      borderLeft: '3px solid var(--border)',
      paddingLeft: '1.2em',
      margin: '1.5em 0',
      fontStyle: 'italic',
      color: '#666',
    }} {...props} />
  ),
  
  // Links
  a: ({ node, href, children, ...props }: any) => {
    // Check if it's a YouTube link
    if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
      const youtubeId = getYouTubeId(href)
      if (youtubeId) {
        return (
          <div style={{ margin: '2em 0', position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: 4,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }
    
    return (
      <a
        href={href}
        {...props}
        style={{
          color: 'var(--text)',
          borderBottom: '1px solid #ccc',
          textDecoration: 'none',
          paddingBottom: 1,
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  },
  
  // Images
  img: ({ node, ...props }: any) => (
    <img
      {...props}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        borderRadius: 4,
        margin: '2em 0',
        display: 'block',
      }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  ),
  
  // Horizontal rule
  hr: ({ node, ...props }: any) => (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--border)',
      margin: '2em 0',
    }} {...props} />
  ),
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-blog">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

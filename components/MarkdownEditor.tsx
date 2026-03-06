'use client'

import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function MarkdownEditor({ value, onChange, placeholder, rows = 20 }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    
    onChange(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { label: 'H1', action: () => insertMarkdown('# ', '') },
    { label: 'H2', action: () => insertMarkdown('## ', '') },
    { label: 'H3', action: () => insertMarkdown('### ', '') },
    { label: 'B', action: () => insertMarkdown('**', '**') },
    { label: 'I', action: () => insertMarkdown('*', '*') },
    { label: 'Code', action: () => insertMarkdown('`', '`') },
    { label: 'Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Image', action: () => insertMarkdown('![alt](', ')') },
    { label: 'YouTube', action: () => onChange(value + '\n\nhttps://www.youtube.com/watch?v=VIDEO_ID\n\n') },
    { label: 'List', action: () => insertMarkdown('- ', '') },
    { label: 'Quote', action: () => insertMarkdown('> ', '') },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12,
        padding: '8px 12px',
        background: 'var(--hover)',
        borderRadius: 4,
        border: '1px solid var(--border)',
      }}>
        {toolbarButtons.map((btn, i) => (
          <button
            key={i}
            type="button"
            onClick={btn.action}
            style={{
              fontSize: '0.75rem',
              padding: '4px 10px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 3,
              cursor: 'pointer',
              color: 'var(--text)',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 300,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--text)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
            }}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            background: showPreview ? 'var(--text)' : 'transparent',
            color: showPreview ? 'var(--bg)' : 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 300,
          }}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '20px',
          minHeight: `${rows * 24}px`,
          background: 'var(--bg)',
        }}>
          <MarkdownRenderer content={value || '*No content yet*'} />
        </div>
      ) : (
        <textarea
          name="content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "write here. use markdown for formatting.\n\n# Heading\n\n**bold** *italic*\n\n- list item\n\n![image](url)\n\nhttps://youtube.com/watch?v=..."}
          rows={rows}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '16px',
            fontSize: '0.95rem',
            fontFamily: 'Monaco, "Courier New", monospace',
            fontWeight: 300,
            color: 'var(--text)',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
      )}

      {/* Help text */}
      <div style={{
        marginTop: 8,
        fontSize: '0.72rem',
        color: 'var(--muted)',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        markdown supported: headings, **bold**, *italic*, `code`, links, images, youtube links, lists, quotes
      </div>
    </div>
  )
}

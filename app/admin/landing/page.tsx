'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import * as store from '@/lib/store-client'
import { LandingPageSection, LandingPageLink, LandingPageEvent, SocialMediaLink } from '@/types'

export default function LandingPageEditor() {
  const router = useRouter()
  const [sections, setSections] = useState<LandingPageSection[]>([])
  const [links, setLinks] = useState<Record<string, LandingPageLink[]>>({})
  const [events, setEvents] = useState<Record<string, LandingPageEvent[]>>({})
  const [social, setSocial] = useState<Record<string, SocialMediaLink[]>>({})
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function load() {
      setMounted(true)
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }
      try {
        const sectionsData = await store.getAllLandingSections()
        setSections(sectionsData)

        const linksMap: Record<string, LandingPageLink[]> = {}
        const eventsMap: Record<string, LandingPageEvent[]> = {}
        const socialMap: Record<string, SocialMediaLink[]> = {}

        for (const section of sectionsData) {
          if (section.type === 'links') {
            linksMap[section.id] = await store.getLandingLinks(section.id)
          } else if (section.type === 'events') {
            eventsMap[section.id] = await store.getLandingEvents(section.id)
          } else if (section.type === 'social') {
            socialMap[section.id] = await store.getLandingSocial(section.id)
          }
        }

        setLinks(linksMap)
        setEvents(eventsMap)
        setSocial(socialMap)
      } catch (error) {
        console.error('Failed to load landing page data:', error)
      }
    }
    load()
  }, [router])

  const handleAddSection = async (type: LandingPageSection['type']) => {
    try {
      const newSection = await store.createLandingSection({
        type,
        title: '',
        content: '',
        order: sections.length,
        visible: true,
      })
      setSections([...sections, newSection])
      setEditingSection(newSection.id)
    } catch (error) {
      console.error('Failed to create section:', error)
      alert('Failed to create section')
    }
  }

  const handleUpdateSection = async (id: string, data: Partial<LandingPageSection>) => {
    try {
      const updated = await store.updateLandingSection(id, data)
      setSections(sections.map(s => s.id === id ? updated : s))
    } catch (error) {
      console.error('Failed to update section:', error)
      alert('Failed to update section')
    }
  }

  const handleReorderSections = async (fromIndex: number, toIndex: number) => {
    const newSections = [...sections]
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)
    
    // Update order for all sections
    const updates = newSections.map((section, index) => ({
      ...section,
      order: index
    }))
    
    setSections(updates)
    
    // Save all order updates
    try {
      await Promise.all(updates.map(s => store.updateLandingSection(s.id, { order: s.order })))
    } catch (error) {
      console.error('Failed to reorder sections:', error)
      alert('Failed to reorder sections')
    }
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return
    try {
      await store.deleteLandingSection(id)
      setSections(sections.filter(s => s.id !== id))
      delete links[id]
      delete events[id]
      delete social[id]
    } catch (error) {
      console.error('Failed to delete section:', error)
      alert('Failed to delete section')
    }
  }

  const handleAddLink = async (sectionId: string) => {
    try {
      const newLink = await store.createLandingLink({
        sectionId,
        label: 'New Link',
        url: 'https://',
        order: (links[sectionId]?.length || 0),
      })
      setLinks({ ...links, [sectionId]: [...(links[sectionId] || []), newLink] })
    } catch (error) {
      console.error('Failed to create link:', error)
      alert('Failed to create link')
    }
  }

  const handleUpdateLink = async (id: string, data: Partial<LandingPageLink>) => {
    try {
      const updated = await store.updateLandingLink(id, data)
      const sectionId = updated.sectionId
      setLinks({
        ...links,
        [sectionId]: (links[sectionId] || []).map(l => l.id === id ? updated : l),
      })
    } catch (error) {
      console.error('Failed to update link:', error)
      alert('Failed to update link')
    }
  }

  const handleDeleteLink = async (id: string, sectionId: string) => {
    try {
      await store.deleteLandingLink(id)
      setLinks({
        ...links,
        [sectionId]: (links[sectionId] || []).filter(l => l.id !== id),
      })
    } catch (error) {
      console.error('Failed to delete link:', error)
      alert('Failed to delete link')
    }
  }

  const handleAddEvent = async (sectionId: string) => {
    try {
      const newEvent = await store.createLandingEvent({
        sectionId,
        title: 'New Event',
        date: new Date().toISOString().split('T')[0],
        order: (events[sectionId]?.length || 0),
      })
      setEvents({ ...events, [sectionId]: [...(events[sectionId] || []), newEvent] })
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Failed to create event')
    }
  }

  const handleUpdateEvent = async (id: string, data: Partial<LandingPageEvent>) => {
    try {
      const updated = await store.updateLandingEvent(id, data)
      const sectionId = updated.sectionId
      setEvents({
        ...events,
        [sectionId]: (events[sectionId] || []).map(e => e.id === id ? updated : e),
      })
    } catch (error) {
      console.error('Failed to update event:', error)
      alert('Failed to update event')
    }
  }

  const handleDeleteEvent = async (id: string, sectionId: string) => {
    try {
      await store.deleteLandingEvent(id)
      setEvents({
        ...events,
        [sectionId]: (events[sectionId] || []).filter(e => e.id !== id),
      })
    } catch (error) {
      console.error('Failed to delete event:', error)
      alert('Failed to delete event')
    }
  }

  const handleAddSocial = async (sectionId: string) => {
    try {
      const newSocial = await store.createLandingSocial({
        sectionId,
        platform: 'Platform',
        url: 'https://',
        order: (social[sectionId]?.length || 0),
      })
      setSocial({ ...social, [sectionId]: [...(social[sectionId] || []), newSocial] })
    } catch (error) {
      console.error('Failed to create social link:', error)
      alert('Failed to create social link')
    }
  }

  const handleUpdateSocial = async (id: string, data: Partial<SocialMediaLink>) => {
    try {
      const updated = await store.updateLandingSocial(id, data)
      const sectionId = updated.sectionId
      setSocial({
        ...social,
        [sectionId]: (social[sectionId] || []).map(s => s.id === id ? updated : s),
      })
    } catch (error) {
      console.error('Failed to update social link:', error)
      alert('Failed to update social link')
    }
  }

  const handleDeleteSocial = async (id: string, sectionId: string) => {
    try {
      await store.deleteLandingSocial(id)
      setSocial({
        ...social,
        [sectionId]: (social[sectionId] || []).filter(s => s.id !== id),
      })
    } catch (error) {
      console.error('Failed to delete social link:', error)
      alert('Failed to delete social link')
    }
  }

  if (!mounted) return null
  if (!isAuthenticated()) return null

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 120px' }}>
        <div className="fade-up" style={{ marginBottom: 60 }}>
          <Link href="/admin" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)', marginBottom: 16, display: 'inline-block' }}>
            ← back to admin
          </Link>
          <h1 style={{
            fontFamily: 'Lora, Georgia, serif',
            fontWeight: 500,
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            marginBottom: 8,
          }}>
            edit landing page.
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 300 }}>
            customize your landing page sections, links, events, and social media.
          </p>
        </div>

        <div className="fade-up fade-up-delay-1" style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Lora, serif', fontWeight: 400, fontSize: '1.3rem', marginBottom: 16 }}>
            add section
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(['hero', 'text', 'image', 'links', 'events', 'social'] as const).map(type => (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.88rem',
                  padding: '10px 24px',
                  background: 'transparent',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>

        <div className="fade-up fade-up-delay-2">
          <h2 style={{ fontFamily: 'Lora, serif', fontWeight: 400, fontSize: '1.3rem', marginBottom: 24 }}>
            sections
          </h2>

          {sections.length === 0 ? (
            <div style={{ 
              border: '1px solid var(--border)', 
              borderRadius: 6, 
              padding: 24,
              background: 'var(--hover)',
            }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 12 }}>
                no sections yet. the landing page is currently showing default content.
              </p>
              <p style={{ color: 'var(--text)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.6 }}>
                <strong>to edit the default content:</strong> click "+ hero" above to create a hero section. 
                this will replace the default "writing things down." text on your landing page.
              </p>
              <button
                onClick={() => handleAddSection('hero')}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.88rem',
                  padding: '10px 24px',
                  background: 'var(--text)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                create hero section
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {sections.map((section, index) => (
                <DraggableSection
                  key={section.id}
                  index={index}
                  section={section}
                  links={links[section.id] || []}
                  events={events[section.id] || []}
                  social={social[section.id] || []}
                  onUpdate={handleUpdateSection}
                  onDelete={handleDeleteSection}
                  onReorder={handleReorderSections}
                  onAddLink={() => handleAddLink(section.id)}
                  onUpdateLink={handleUpdateLink}
                  onDeleteLink={(id) => handleDeleteLink(id, section.id)}
                  onAddEvent={() => handleAddEvent(section.id)}
                  onUpdateEvent={handleUpdateEvent}
                  onDeleteEvent={(id) => handleDeleteEvent(id, section.id)}
                  onAddSocial={() => handleAddSocial(section.id)}
                  onUpdateSocial={handleUpdateSocial}
                  onDeleteSocial={(id) => handleDeleteSocial(id, section.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function DraggableSection({
  index,
  section,
  links,
  events,
  social,
  onUpdate,
  onDelete,
  onReorder,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddSocial,
  onUpdateSocial,
  onDeleteSocial,
}: {
  index: number
  section: LandingPageSection
  links: LandingPageLink[]
  events: LandingPageEvent[]
  social: SocialMediaLink[]
  onUpdate: (id: string, data: Partial<LandingPageSection>) => void
  onDelete: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onAddLink: () => void
  onUpdateLink: (id: string, data: Partial<LandingPageLink>) => void
  onDeleteLink: (id: string) => void
  onAddEvent: () => void
  onUpdateEvent: (id: string, data: Partial<LandingPageEvent>) => void
  onDeleteEvent: (id: string) => void
  onAddSocial: () => void
  onUpdateSocial: (id: string, data: Partial<SocialMediaLink>) => void
  onDeleteSocial: (id: string) => void
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const fromIndex = parseInt(e.dataTransfer.getData('text/html'))
    if (fromIndex !== index) {
      onReorder(fromIndex, index)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={() => setIsDragging(false)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 8,
        padding: '8px 12px',
        background: 'var(--hover)',
        borderRadius: 4,
        fontSize: '0.72rem',
        color: 'var(--muted)',
      }}>
        <span>⋮⋮</span>
        <span>drag to reorder</span>
      </div>
      <SectionEditor
        section={section}
        links={links}
        events={events}
        social={social}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddLink={onAddLink}
        onUpdateLink={onUpdateLink}
        onDeleteLink={onDeleteLink}
        onAddEvent={onAddEvent}
        onUpdateEvent={onUpdateEvent}
        onDeleteEvent={onDeleteEvent}
        onAddSocial={onAddSocial}
        onUpdateSocial={onUpdateSocial}
        onDeleteSocial={onDeleteSocial}
      />
    </div>
  )
}

function SectionEditor({
  section,
  links,
  events,
  social,
  onUpdate,
  onDelete,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onAddSocial,
  onUpdateSocial,
  onDeleteSocial,
}: {
  section: LandingPageSection
  links: LandingPageLink[]
  events: LandingPageEvent[]
  social: SocialMediaLink[]
  onUpdate: (id: string, data: Partial<LandingPageSection>) => void
  onDelete: (id: string) => void
  onAddLink: () => void
  onUpdateLink: (id: string, data: Partial<LandingPageLink>) => void
  onDeleteLink: (id: string) => void
  onAddEvent: () => void
  onUpdateEvent: (id: string, data: Partial<LandingPageEvent>) => void
  onDeleteEvent: (id: string) => void
  onAddSocial: () => void
  onUpdateSocial: (id: string, data: Partial<SocialMediaLink>) => void
  onDeleteSocial: (id: string) => void
}) {
  const [title, setTitle] = useState(section.title || '')
  const [content, setContent] = useState(section.content || '')
  const [visible, setVisible] = useState(section.visible)

  useEffect(() => {
    setTitle(section.title || '')
    setContent(section.content || '')
    setVisible(section.visible)
  }, [section])

  const handleSave = () => {
    onUpdate(section.id, { title, content, visible })
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {section.type}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => {
                setVisible(e.target.checked)
                onUpdate(section.id, { visible: e.target.checked })
              }}
            />
            visible
          </label>
          <button
            onClick={() => onDelete(section.id)}
            style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            delete
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>
            title {section.type !== 'hero' && section.type !== 'text' && '(optional)'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              // Auto-save on change for better UX
              onUpdate(section.id, { title: e.target.value, content, visible })
            }}
            onBlur={handleSave}
            placeholder="Section title"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              background: 'transparent',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem',
              color: 'var(--text)',
            }}
          />
        </div>

        {(section.type === 'hero' || section.type === 'text' || section.type === 'image') && (
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }}>
              content {section.type === 'image' && '(optional caption)'}
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                // Auto-save on change for better UX
                onUpdate(section.id, { title, content: e.target.value, visible })
              }}
              onBlur={handleSave}
              rows={section.type === 'image' ? 3 : 6}
              placeholder={section.type === 'image' ? 'Optional caption or description for the image' : 'Enter content here...'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 4,
                background: 'transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem',
                color: 'var(--text)',
                resize: 'vertical',
              }}
            />
            {(section.type === 'hero' || section.type === 'text') && (
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                use markdown links: [text](url)
              </div>
            )}
          </div>
        )}

        {section.type === 'links' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                links
              </label>
              <button
                onClick={onAddLink}
                style={{ fontSize: '0.78rem', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderBottom: '1px solid var(--border)' }}
              >
                + add link
              </button>
            </div>
            {links.map(link => (
              <LinkEditor
                key={link.id}
                link={link}
                onUpdate={onUpdateLink}
                onDelete={onDeleteLink}
              />
            ))}
          </div>
        )}

        {section.type === 'events' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                events
              </label>
              <button
                onClick={onAddEvent}
                style={{ fontSize: '0.78rem', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderBottom: '1px solid var(--border)' }}
              >
                + add event
              </button>
            </div>
            {events.map(event => (
              <EventEditor
                key={event.id}
                event={event}
                onUpdate={onUpdateEvent}
                onDelete={onDeleteEvent}
              />
            ))}
          </div>
        )}

        {section.type === 'social' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                social media
              </label>
              <button
                onClick={onAddSocial}
                style={{ fontSize: '0.78rem', color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, borderBottom: '1px solid var(--border)' }}
              >
                + add social
              </button>
            </div>
            {social.map(item => (
              <SocialEditor
                key={item.id}
                social={item}
                onUpdate={onUpdateSocial}
                onDelete={onDeleteSocial}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinkEditor({ link, onUpdate, onDelete }: { link: LandingPageLink; onUpdate: (id: string, data: Partial<LandingPageLink>) => void; onDelete: (id: string) => void }) {
  const [label, setLabel] = useState(link.label)
  const [url, setUrl] = useState(link.url)

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 4 }}>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => onUpdate(link.id, { label, url })}
        placeholder="Label"
        style={{ flex: 1, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => onUpdate(link.id, { label, url })}
        placeholder="URL"
        style={{ flex: 2, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
      />
      <button onClick={() => onDelete(link.id)} style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer' }}>
        delete
      </button>
    </div>
  )
}

function EventEditor({ event, onUpdate, onDelete }: { event: LandingPageEvent; onUpdate: (id: string, data: Partial<LandingPageEvent>) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || '')
  const [date, setDate] = useState(event.date)
  const [url, setUrl] = useState(event.url || '')

  return (
    <div style={{ marginBottom: 16, padding: 12, border: '1px solid var(--border)', borderRadius: 4 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onUpdate(event.id, { title, description, date, url })}
          placeholder="Event title"
          style={{ flex: 1, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => onUpdate(event.id, { title, description, date, url })}
          style={{ padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => onUpdate(event.id, { title, description, date, url })}
        placeholder="Description"
        rows={2}
        style={{ width: '100%', padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={() => onUpdate(event.id, { title, description, date, url })}
          placeholder="Event URL (optional)"
          style={{ flex: 1, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
        />
        <button onClick={() => onDelete(event.id)} style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer' }}>
          delete
        </button>
      </div>
    </div>
  )
}

function SocialEditor({ social, onUpdate, onDelete }: { social: SocialMediaLink; onUpdate: (id: string, data: Partial<SocialMediaLink>) => void; onDelete: (id: string) => void }) {
  const [platform, setPlatform] = useState(social.platform)
  const [url, setUrl] = useState(social.url)

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 12, border: '1px solid var(--border)', borderRadius: 4 }}>
      <input
        type="text"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        onBlur={() => onUpdate(social.id, { platform, url })}
        placeholder="Platform (e.g., Twitter, GitHub)"
        style={{ flex: 1, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => onUpdate(social.id, { platform, url })}
        placeholder="URL"
        style={{ flex: 2, padding: '6px 10px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', fontSize: '0.9rem' }}
      />
      <button onClick={() => onDelete(social.id)} style={{ fontSize: '0.78rem', color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer' }}>
        delete
      </button>
    </div>
  )
}

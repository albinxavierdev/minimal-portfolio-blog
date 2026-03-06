import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('sectionId')
    
    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }
    
    const events = store.getLandingEvents(sectionId)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching landing events:', error)
    return NextResponse.json({ error: 'Failed to fetch landing events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const event = store.createLandingEvent(data)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating landing event:', error)
    return NextResponse.json({ error: 'Failed to create landing event' }, { status: 500 })
  }
}

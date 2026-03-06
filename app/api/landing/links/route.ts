import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('sectionId')
    
    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }
    
    const links = store.getLandingLinks(sectionId)
    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching landing links:', error)
    return NextResponse.json({ error: 'Failed to fetch landing links' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const link = store.createLandingLink(data)
    return NextResponse.json(link)
  } catch (error) {
    console.error('Error creating landing link:', error)
    return NextResponse.json({ error: 'Failed to create landing link' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const all = searchParams.get('all') === 'true'
    
    const sections = all ? store.getAllLandingSections() : store.getLandingSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching landing sections:', error)
    return NextResponse.json({ error: 'Failed to fetch landing sections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const section = store.createLandingSection(data)
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating landing section:', error)
    return NextResponse.json({ error: 'Failed to create landing section' }, { status: 500 })
  }
}

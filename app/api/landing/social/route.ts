import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('sectionId')
    
    if (!sectionId) {
      return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
    }
    
    const social = store.getLandingSocial(sectionId)
    return NextResponse.json(social)
  } catch (error) {
    console.error('Error fetching landing social:', error)
    return NextResponse.json({ error: 'Failed to fetch landing social' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const social = store.createLandingSocial(data)
    return NextResponse.json(social)
  } catch (error) {
    console.error('Error creating landing social:', error)
    return NextResponse.json({ error: 'Failed to create landing social' }, { status: 500 })
  }
}

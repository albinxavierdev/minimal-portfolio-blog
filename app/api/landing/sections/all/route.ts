import { NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET() {
  try {
    const sections = store.getAllLandingSections()
    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching all landing sections:', error)
    return NextResponse.json({ error: 'Failed to fetch landing sections' }, { status: 500 })
  }
}

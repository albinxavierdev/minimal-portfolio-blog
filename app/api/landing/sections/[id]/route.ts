import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const section = store.updateLandingSection(params.id, data)
    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating landing section:', error)
    return NextResponse.json({ error: 'Failed to update landing section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    store.deleteLandingSection(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing section:', error)
    return NextResponse.json({ error: 'Failed to delete landing section' }, { status: 500 })
  }
}

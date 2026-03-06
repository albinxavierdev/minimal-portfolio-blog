import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const event = store.updateLandingEvent(params.id, data)
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating landing event:', error)
    return NextResponse.json({ error: 'Failed to update landing event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    store.deleteLandingEvent(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing event:', error)
    return NextResponse.json({ error: 'Failed to delete landing event' }, { status: 500 })
  }
}

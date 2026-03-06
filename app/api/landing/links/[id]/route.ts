import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const link = store.updateLandingLink(params.id, data)
    return NextResponse.json(link)
  } catch (error) {
    console.error('Error updating landing link:', error)
    return NextResponse.json({ error: 'Failed to update landing link' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    store.deleteLandingLink(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing link:', error)
    return NextResponse.json({ error: 'Failed to delete landing link' }, { status: 500 })
  }
}

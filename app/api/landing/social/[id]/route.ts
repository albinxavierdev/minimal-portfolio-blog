import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const social = store.updateLandingSocial(params.id, data)
    return NextResponse.json(social)
  } catch (error) {
    console.error('Error updating landing social:', error)
    return NextResponse.json({ error: 'Failed to update landing social' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    store.deleteLandingSocial(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing social:', error)
    return NextResponse.json({ error: 'Failed to delete landing social' }, { status: 500 })
  }
}

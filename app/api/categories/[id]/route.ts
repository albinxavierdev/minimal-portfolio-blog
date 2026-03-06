import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    store.deleteCategory(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

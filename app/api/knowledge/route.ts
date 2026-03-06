import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (query) {
      const results = store.searchKnowledgeBase(query, limit)
      return NextResponse.json(results)
    }
    
    const all = store.getAllKnowledgeEntries()
    return NextResponse.json(all)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

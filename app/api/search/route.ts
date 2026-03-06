import { NextRequest, NextResponse } from 'next/server'
import { searchIndex } from '@/lib/faiss-index'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }
    
    const results = await searchIndex(query, limit)
    
    return NextResponse.json({
      query,
      results,
      count: results.length,
    })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}

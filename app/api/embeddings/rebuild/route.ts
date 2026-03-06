import { NextRequest, NextResponse } from 'next/server'
import { rebuildIndex } from '@/lib/faiss-index'
import { isAuthenticated } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - you might want to protect this)
    // const authHeader = request.headers.get('authorization')
    // if (!isAuthenticated()) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    console.log('Starting index rebuild...')
    await rebuildIndex()
    
    return NextResponse.json({
      success: true,
      message: 'Index rebuilt successfully',
    })
  } catch (error: any) {
    console.error('Rebuild error:', error)
    return NextResponse.json(
      { error: error.message || 'Rebuild failed' },
      { status: 500 }
    )
  }
}

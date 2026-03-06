import { NextRequest, NextResponse } from 'next/server'
import * as store from '@/lib/store-sqlite'

export async function GET() {
  try {
    const posts = store.getPosts()
    return NextResponse.json(posts)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const post = store.createPost(body)
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

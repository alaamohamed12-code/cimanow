import { type NextRequest, NextResponse } from 'next/server'
import { fetchWatchData } from '@/lib/fetchWatchData'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')
  const url = rawUrl
    ? rawUrl
        .replace(/^http:\/\/(?:www\.)?go\.ak\.sv/i, 'https://go.ak.sv')
        .replace(/^http:\/\/(?:www\.)?ak\.sv/i, 'https://ak.sv')
    : null

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  if (!url.startsWith('http')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const data = await fetchWatchData(url)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    })
  } catch (err) {
    console.error('[/api/watch]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

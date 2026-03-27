import { NextRequest, NextResponse } from 'next/server'
import { getSearchResults } from '@/lib/fetchSearchResults'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const page = Number.parseInt(searchParams.get('page') || '1', 10)

  try {
    const data = await getSearchResults(query, page)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Search fetch error:', error)
    return NextResponse.json(
      { items: [], page, totalPages: 1 },
      { status: 500 }
    )
  }
}

export const revalidate = 120
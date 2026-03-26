import { NextRequest, NextResponse } from 'next/server'
import { getMoviesListing, type SourceFilters } from '@/lib/fetchMoviesListing'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get('page') || '1', 10)
  const search = searchParams.get('search') || undefined

  const sourceFilters: SourceFilters = {}
  for (const [key, value] of searchParams.entries()) {
    if (key === 'page' || key === 'search') {
      continue
    }
    if (value) {
      sourceFilters[key] = value
    }
  }

  try {
    const data = await getMoviesListing(page, sourceFilters, search)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Movies list fetch error:', error)
    return NextResponse.json(
      {
        items: [],
        page,
        totalPages: 1,
        filterFields: [],
      },
      { status: 500 }
    )
  }
}

export const revalidate = 1800
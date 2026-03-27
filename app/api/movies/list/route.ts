import { NextRequest, NextResponse } from 'next/server'
import { getMoviesListing, type SourceFilters } from '@/lib/fetchMoviesListing'
import { mockMovies } from '@/lib/mockData'
import { readListingSnapshot } from '@/lib/readListingSnapshot'

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

  const shouldPreferSnapshot = process.env.NODE_ENV === 'production' || process.env.FORCE_STATIC_LISTINGS === 'true'

  if (shouldPreferSnapshot) {
    return NextResponse.json(readListingSnapshot('movies.json', mockMovies, page, search), { status: 200 })
  }

  try {
    const data = await getMoviesListing(page, sourceFilters, search)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Movies list fetch error:', error)
    return NextResponse.json(readListingSnapshot('movies.json', mockMovies, page, search), { status: 200 })
  }
}

export const revalidate = 1800

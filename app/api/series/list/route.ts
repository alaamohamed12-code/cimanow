import { NextRequest, NextResponse } from 'next/server'
import { getSeriesListing, type SourceFilters } from '@/lib/fetchSeriesListing'
import { mockSeries } from '@/lib/mockData'

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
    const data = await getSeriesListing(page, sourceFilters, search)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Series list fetch error:', error)
    // fallback to mockSeries
    return NextResponse.json(
      {
        items: mockSeries,
        page,
        totalPages: 1,
        filterFields: [],
      },
      { status: 200 }
    )
  }
}

export const revalidate = 120

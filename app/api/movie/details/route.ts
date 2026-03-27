import { NextRequest, NextResponse } from 'next/server'
import { getMovieDetails } from '@/lib/fetchMovieDetails'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'Missing movie path' }, { status: 400 })
  }

  try {
    const details = await getMovieDetails(path)
    return NextResponse.json(details, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Movie details fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch movie details' }, { status: 500 })
  }
}

export const revalidate = 120

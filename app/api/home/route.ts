
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getMainHomeContent } from '@/lib/fetchMainPage'
import { getStaticHomeContent } from '@/lib/staticCatalog'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(getStaticHomeContent(), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    })
  }

  try {
    const data = await getMainHomeContent()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Home main fetch error:', error)
    return NextResponse.json(
      {
        featured: [],
        movies: [],
        series: [],
        shows: [],
      },
      { status: 500 }
    )
  }
}

export const revalidate = 120

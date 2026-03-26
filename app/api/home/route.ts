import { NextResponse } from 'next/server'
import { getMainHomeContent } from '@/lib/fetchMainPage'

export async function GET() {
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

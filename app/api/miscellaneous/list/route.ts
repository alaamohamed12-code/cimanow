import { NextRequest, NextResponse } from 'next/server'
import { mockMiscellaneous } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get('page') || '1', 10)

  try {
    // في الوقت الحالي لا يوجد جلب خارجي حقيقي، فقط mock
    return NextResponse.json({
      items: mockMiscellaneous,
      page,
      totalPages: 1,
      filterFields: [],
    })
  } catch (error) {
    console.error('Miscellaneous list fetch error:', error)
    return NextResponse.json({
      items: mockMiscellaneous,
      page,
      totalPages: 1,
      filterFields: [],
    }, { status: 200 })
  }
}

export const revalidate = 120;
import { NextRequest, NextResponse } from 'next/server'
import { getSeriesListing, type SourceFilters } from '@/lib/fetchSeriesListing'
import { mockSeries } from '@/lib/mockData'
import { filterStaticListing } from '@/lib/staticListing'
import fs from 'fs';
import path from 'path';

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

  if (process.env.NODE_ENV === 'production') {
    try {
      const filePath = path.join(process.cwd(), 'lib', 'series.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return NextResponse.json(filterStaticListing(data, page, search, sourceFilters));
    } catch (error) {
      console.error('Series list file read error:', error);
      return NextResponse.json({ items: mockSeries, page, totalPages: 1, filterFields: [] }, { status: 200 });
    }
  } else {
    try {
      const data = await getSeriesListing(page, sourceFilters, search);
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    } catch (error) {
      console.error('Series list fetch error:', error);
      return NextResponse.json({ items: mockSeries, page, totalPages: 1, filterFields: [] }, { status: 200 });
    }
  }
}

export const revalidate = 120

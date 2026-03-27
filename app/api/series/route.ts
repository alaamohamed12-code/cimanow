import { NextResponse } from 'next/server';
import { getSeriesContent } from '@/lib/fetchLiveData';
import { getStaticSeries } from '@/lib/staticCatalog';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(getStaticSeries());
  }

  try {
    const data = await getSeriesContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

import { NextResponse } from 'next/server';
import { getShowsContent } from '@/lib/fetchLiveData';
import { getStaticShows } from '@/lib/staticCatalog';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(getStaticShows());
  }

  try {
    const data = await getShowsContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

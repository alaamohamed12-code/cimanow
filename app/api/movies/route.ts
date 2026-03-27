import { NextResponse } from 'next/server';
import { getMoviesContent } from '@/lib/fetchLiveData';
import { getStaticMovies } from '@/lib/staticCatalog';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(getStaticMovies());
  }

  try {
    const data = await getMoviesContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

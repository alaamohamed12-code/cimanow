import { NextResponse } from 'next/server';
import { getMoviesContent } from '@/lib/fetchLiveData';

export async function GET() {
  try {
    const data = await getMoviesContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

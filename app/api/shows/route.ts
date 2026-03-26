import { NextResponse } from 'next/server';
import { getShowsContent } from '@/lib/fetchLiveData';

export async function GET() {
  try {
    const data = await getShowsContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

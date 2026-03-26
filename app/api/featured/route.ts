import { NextResponse } from 'next/server';
import { getFeaturedContent } from '@/lib/fetchLiveData';

export async function GET() {
  try {
    const data = await getFeaturedContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching featured data:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

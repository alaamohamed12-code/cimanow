import { NextResponse } from 'next/server';
import { getSeriesContent } from '@/lib/fetchLiveData';

export async function GET() {
  try {
    const data = await getSeriesContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

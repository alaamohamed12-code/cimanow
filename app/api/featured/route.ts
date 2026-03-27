
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getFeaturedContent } from '@/lib/fetchLiveData';
import { getStaticFeatured } from '@/lib/staticCatalog';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(getStaticFeatured());
  }

  try {
    const data = await getFeaturedContent();
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching featured data:', error);
    return NextResponse.json([]);
  }
}

export const revalidate = 3600;

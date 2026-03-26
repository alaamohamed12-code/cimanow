export const dynamic = 'force-dynamic';
'use client'

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { mockMovies } from '@/lib/mockData'
import { toLocalContentPath } from '@/lib/moviePath'

export default function MoviesPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/movies/list?page=1"
      initialItems={mockMovies}
      heroBadgeLabel="أفلام"
      sectionTitle="افلام مميزة"
      sectionPath="/movies"
      onNavigate={(content) => toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

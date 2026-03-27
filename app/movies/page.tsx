
'use client'
export const dynamic = 'force-dynamic';


import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { toLocalContentPath } from '@/lib/moviePath'

export default function MoviesPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/movies/list?page=1"
      heroBadgeLabel="أفلام"
      sectionTitle="افلام مميزة"
      sectionPath="/movies"
      onNavigate={(content) => toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

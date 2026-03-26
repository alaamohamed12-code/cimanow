
'use client'
export const dynamic = 'force-dynamic';

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { toLocalShowsPath, toLocalContentPath } from '@/lib/moviePath'

export default function ShowsPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/shows/list?page=1"
      heroBadgeLabel="برامج تلفزيونية"
      sectionTitle="العيد معنا احلى"
      sectionPath="/shows"
      sectionBadge="حصري"
      onNavigate={(content) => toLocalShowsPath(content.sourceUrl) || toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

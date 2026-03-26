export const dynamic = 'force-dynamic';
'use client'

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { mockMiscellaneous } from '@/lib/mockData'
import { toLocalShowsPath, toLocalContentPath } from '@/lib/moviePath'

export default function ShowsPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/shows/list?page=1"
      initialItems={mockMiscellaneous}
      heroBadgeLabel="برامج تلفزيونية"
      sectionTitle="العيد معنا احلى"
      sectionPath="/shows"
      sectionBadge="حصري"
      onNavigate={(content) => toLocalShowsPath(content.sourceUrl) || toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

export const dynamic = 'force-dynamic';
'use client'

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { mockMiscellaneous } from '@/lib/mockData'
import { toLocalMixPath, toLocalContentPath } from '@/lib/moviePath'

export default function MiscellaneousPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/mix/list?page=1"
      initialItems={mockMiscellaneous}
      heroBadgeLabel="منوعات"
      sectionTitle="مسابقات ومنوعات"
      sectionPath="/miscellaneous"
      onNavigate={(content) => toLocalMixPath(content.sourceUrl) || toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

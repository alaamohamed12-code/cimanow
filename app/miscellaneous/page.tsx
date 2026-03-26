
'use client'
export const dynamic = 'force-dynamic';

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { toLocalMixPath, toLocalContentPath } from '@/lib/moviePath'

export default function MiscellaneousPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/mix/list?page=1"
      heroBadgeLabel="منوعات"
      sectionTitle="مسابقات ومنوعات"
      sectionPath="/miscellaneous"
      onNavigate={(content) => toLocalMixPath(content.sourceUrl) || toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

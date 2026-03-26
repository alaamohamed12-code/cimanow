'use client'

import HomeStyleCategoryPage from '@/components/HomeStyleCategoryPage'
import { mockSeries } from '@/lib/mockData'
import { toLocalSeriesPath, toLocalContentPath } from '@/lib/moviePath'

export default function SeriesPage() {
  return (
    <HomeStyleCategoryPage
      fetchUrl="/api/series/list?page=1"
      initialItems={mockSeries}
      heroBadgeLabel="مسلسلات"
      sectionTitle="المسلسلات العربية والعالمية"
      sectionPath="/series"
      onNavigate={(content) => toLocalSeriesPath(content.sourceUrl) || toLocalContentPath(content.sourceUrl)}
      paginationEnabled
    />
  )
}

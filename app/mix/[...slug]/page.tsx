export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation'
import { getMixDetails } from '@/lib/fetchMixDetails'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function MixDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []

  if (slug.length < 2) {
    notFound()
  }

  const mixPath = `/mix/${slug.join('/')}`

  let data
  try {
    data = await getMixDetails(mixPath)
  } catch {
    notFound()
  }

  const duration = 'duration' in data ? (data as { duration?: string }).duration : undefined

  return (
    <ContentDetailsPage
      title={data.title}
      poster={data.poster}
      description={data.description}
      rating={data.rating}
      year={data.year}
      quality={data.quality}
      duration={duration}
      genres={data.genres}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'المنوعات', href: '/miscellaneous' },
        { label: data.title },
      ]}
      watchLinks={data.watchLinks}
      downloadLinks={data.downloadLinks}
      recommendations={data.recommendations}
      recommendationsPath="/miscellaneous"
      typeLabel="منوع"
    />
  )
}

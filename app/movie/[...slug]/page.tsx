import { notFound } from 'next/navigation'
import { getMovieDetails } from '@/lib/fetchMovieDetails'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []

  if (slug.length < 2) {
    notFound()
  }

  const moviePath = `/movie/${slug.join('/')}`

  let data
  try {
    data = await getMovieDetails(moviePath)
  } catch {
    notFound()
  }

  return (
    <ContentDetailsPage
      title={data.title}
      poster={data.poster}
      description={data.description}
      rating={data.rating}
      year={data.year}
      quality={data.quality}
      duration={data.duration}
      language={data.language}
      ageRating={data.ageRating}
      genres={data.genres}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'الأفلام', href: '/movies' },
        { label: data.title },
      ]}
      watchLinks={data.watchLinks}
      downloadLinks={data.downloadLinks}
      recommendations={data.recommendations}
      recommendationsPath="/movies"
      typeLabel="فيلم"
    />
  )
}

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEpisodeDetails, EpisodeDetailsPayload } from '@/lib/fetchSeriesEpisodeDetails'
import { toLocalSeriesPath, toLocalShowsPath } from '@/lib/moviePath'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function EpisodeDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []

  if (slug.length < 1) {
    notFound()
  }

  const episodePath = `/episode/${slug.join('/')}`
  const originalEpisodeUrl = `https://ak.sv${episodePath}`

  let data: EpisodeDetailsPayload | null = null
  try {
    data = await getEpisodeDetails(episodePath)
  } catch {
    // show fallback
  }

  if (!data) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <div className="section-shell p-8 max-w-lg mx-auto text-center">
          <div className="text-5xl mb-4">📺</div>
          <h1 className="text-2xl font-bold gradient-text mb-3">تعذّر تحميل تفاصيل الحلقة</h1>
          <p className="text-gray-400 mb-6 text-sm leading-7">
            لم نتمكن من جلب بيانات هذه الحلقة. يمكنك مشاهدتها مباشرةً من الموقع الأصلي.
          </p>
          <a
            href={originalEpisodeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-xl border border-emerald-300/40 bg-emerald-300/15 px-6 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/25"
          >
            مشاهدة الحلقة على الموقع الأصلي ↗
          </a>
          <div className="mt-4">
            <Link href="/shows" className="text-xs text-gray-500 hover:text-gray-300">← الرجوع إلى التلفزيون</Link>
          </div>
        </div>
      </div>
    )
  }

  const seriesHref =
    toLocalSeriesPath(data.seriesSourceUrl) ||
    toLocalShowsPath(data.seriesSourceUrl) ||
    '/series'

  const isShowsEpisode = data.seriesSourceUrl?.includes('/shows/')
  const sectionLabel = isShowsEpisode ? 'البرامج التلفزيونية' : 'المسلسلات'
  const noLinks = data.watchLinks.length === 0 && data.downloadLinks.length === 0

  const extraSection = noLinks ? (
    <section className="mx-auto max-w-[1540px] px-4 pb-6 sm:px-8 lg:px-10">
      <div className="rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-4">
        <p className="text-sm text-amber-200 mb-3">لم يتم العثور على روابط مباشرة. يمكنك مشاهدة الحلقة من الموقع الأصلي:</p>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-lg border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-300/25"
        >
          مشاهدة على الموقع الأصلي ↗
        </a>
      </div>
    </section>
  ) : null

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
      genres={[
        'حلقة',
        data.episodeNumber ? `رقم ${data.episodeNumber}` : '',
      ].filter(Boolean)}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: sectionLabel, href: isShowsEpisode ? '/shows' : '/series' },
        { label: data.seriesTitle || 'السلسلة', href: seriesHref },
        { label: data.title },
      ]}
      watchLinks={data.watchLinks}
      downloadLinks={data.downloadLinks}
      recommendations={data.recommendations}
      recommendationsPath={isShowsEpisode ? '/shows' : '/series'}
      typeLabel="حلقة"
      extraSection={extraSection}
    />
  )
}

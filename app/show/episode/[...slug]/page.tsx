import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEpisodeDetails, EpisodeDetailsPayload } from '@/lib/fetchSeriesEpisodeDetails'
import { toLocalShowsPath } from '@/lib/moviePath'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function ShowEpisodeDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []

  if (slug.length < 1) {
    notFound()
  }

  const episodePath = `/show/episode/${slug.join('/')}`

  let data: EpisodeDetailsPayload | null = null
  try {
    data = await getEpisodeDetails(episodePath)
  } catch {
    // fallback
  }

  if (!data) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <div className="section-shell p-8 max-w-lg mx-auto text-center">
          <div className="text-5xl mb-4">📺</div>
          <h1 className="text-2xl font-bold gradient-text mb-3">تعذّر تحميل الحلقة</h1>
          <p className="text-gray-400 mb-6 text-sm leading-7">لم نتمكن من جلب بيانات هذه الحلقة حاليًا. حاول مرة أخرى بعد قليل.</p>
          <Link href="/shows" className="inline-block rounded-xl border border-emerald-300/40 bg-emerald-300/15 px-6 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-300/25">الرجوع إلى التلفزيون</Link>
        </div>
      </div>
    )
  }

  const showHref = toLocalShowsPath(data.seriesSourceUrl) || '/shows'
  const noLinks = data.watchLinks.length === 0 && data.downloadLinks.length === 0

  const extraSection = noLinks ? (
    <section className="mx-auto max-w-[1540px] px-4 pb-6 sm:px-8 lg:px-10">
      <div className="rounded-[20px] border border-amber-400/30 bg-amber-400/10 p-4">
        <p className="text-sm text-amber-200">لم يتم العثور على روابط تشغيل أو تحميل مباشرة لهذه الحلقة حاليًا.</p>
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
        { label: 'البرامج التلفزيونية', href: '/shows' },
        { label: data.seriesTitle || 'البرنامج', href: showHref },
        { label: data.title },
      ]}
      watchLinks={data.watchLinks}
      downloadLinks={data.downloadLinks}
      recommendations={data.recommendations}
      recommendationsPath="/shows"
      typeLabel="حلقة"
      extraSection={extraSection}
    />
  )
}

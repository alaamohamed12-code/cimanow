export const dynamic = 'force-dynamic';
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSeriesDetails } from '@/lib/fetchSeriesEpisodeDetails'
import { toLocalEpisodePath } from '@/lib/moviePath'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export default async function SeriesDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []

  if (slug.length < 2) {
    notFound()
  }

  const seriesPath = `/series/${slug.join('/')}`

  let data
  try {
    data = await getSeriesDetails(seriesPath)
  } catch {
    notFound()
  }

  const watchLinks = ('watchLinks' in data && Array.isArray((data as { watchLinks?: unknown }).watchLinks)
    ? ((data as { watchLinks: Array<{ url: string; label?: string; quality?: string; size?: string }> }).watchLinks)
    : [])
  const downloadLinks = ('downloadLinks' in data && Array.isArray((data as { downloadLinks?: unknown }).downloadLinks)
    ? ((data as { downloadLinks: Array<{ url: string; label?: string; quality?: string; size?: string }> }).downloadLinks)
    : [])

  const episodesSection = data.episodes.length > 0 ? (
    <section className="mx-auto max-w-[1540px] px-4 pb-12 sm:px-8 lg:px-10">
      <div className="mb-8 flex items-center gap-3 sm:gap-4">
        <span className="h-11 w-2 shrink-0 rounded-full bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_60%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.56),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.22)] sm:h-14" />
        <h2 className="section-title-emphasis font-[family-name:var(--font-cairo)] text-[27px] font-black leading-none text-white [text-shadow:0_8px_22px_rgba(0,0,0,0.5)] sm:text-[36px]">
          حلقات المسلسل
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.episodes.map((episode) => {
          const localPath = toLocalEpisodePath(episode.sourceUrl)
          const href = localPath || episode.sourceUrl || '#'
          const isExternal = !localPath

          return (
            <Link
              key={episode.sourceUrl}
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              className="group relative overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.11)] bg-[#121221] shadow-[0_12px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_22px_40px_rgba(0,0,0,0.48)] hover:border-white/25"
            >
              <div className="relative aspect-[16/9] bg-[#050a16]">
                <Image
                  src={episode.image}
                  alt={episode.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090812]/92 via-[#0b0a16]/48 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/55 to-transparent" />

                <div className="pointer-events-none absolute left-0 top-2.5 z-20">
                  <span className="relative inline-flex min-h-[28px] min-w-[70px] items-center justify-center rounded-r-[10px] bg-[#6d4dff] px-4 py-1 text-center font-[family-name:var(--font-cairo)] text-[12px] font-black leading-none text-white shadow-[0_8px_16px_rgba(86,62,214,0.48)]">
                    حلقة
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-[8px] left-0 h-0 w-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-[#4c35bf]"
                    />
                  </span>
                </div>

                <span className="absolute right-2 top-2 z-20 min-w-[58px] rounded-full bg-[#ffcc17] px-3 py-1.5 text-center font-[family-name:var(--font-cairo)] text-[12px] font-black leading-none text-[#141100] shadow-[0_8px_18px_rgba(255,204,23,0.46)]">
                  الحلقة {episode.episodeNumber || '-'}
                </span>

                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(4,4,10,0.34)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(245,197,24,0.93)] shadow-[0_8px_20px_rgba(245,197,24,0.4)]">
                    <svg className="h-5 w-5 text-[#111]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,8,14,0.2),rgba(8,8,14,0.75))] px-3.5 pb-3.5 pt-3">
                <p className="line-clamp-2 font-[family-name:var(--font-cairo)] text-[13px] font-black leading-snug text-white">
                  {episode.title}
                </p>
                {episode.date ? (
                  <span className="mt-1.5 block text-[11px] font-semibold text-white/60">{episode.date}</span>
                ) : null}
              </div>
            </Link>
          )
        })}
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
      ageRating={data.ageRating}
      genres={data.genres}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'المسلسلات', href: '/series' },
        { label: data.title },
      ]}
      watchLinks={watchLinks.filter(link => link.label).map(link => ({
        ...link,
        label: link.label || 'Unknown',
      }))}
      downloadLinks={downloadLinks.filter(link => link.label).map(link => ({
        ...link,
        label: link.label || 'Unknown',
      }))}
      recommendations={data.recommendations}
      recommendationsPath="/series"
      typeLabel="مسلسل"
      extraSection={episodesSection}
    />
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import CategorySection from '@/components/CategorySection'
import type { Content } from '@/lib/mockData'

interface DetailActionLink {
  label: string
  url: string
  quality?: string
  size?: string
}

interface DetailBreadcrumb {
  label: string
  href?: string
}

interface ContentDetailsPageProps {
  title: string
  poster: string
  description: string
  rating?: number
  year?: number
  quality?: string
  duration?: string
  language?: string
  ageRating?: string
  genres: string[]
  breadcrumbs: DetailBreadcrumb[]
  watchLinks: DetailActionLink[]
  downloadLinks: DetailActionLink[]
  recommendations: Content[]
  recommendationsPath: string
  typeLabel: string
  extraSection?: ReactNode
  hideHeroWatchButton?: boolean
  hideActionLinksSection?: boolean
}

const QUALITY_ORDER = ['4K', '2160p', '1440p', '1080p', '720p', '480p', '360p', 'AUTO'] as const

const getQualityRank = (quality: string): number => {
  const normalized = quality.trim().toUpperCase().replace('P', 'p')
  const index = QUALITY_ORDER.findIndex((item) => item.toUpperCase() === normalized.toUpperCase())
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

const buildMetaItems = (
  typeLabel: string,
  genres: string[],
  rating?: number,
  year?: number
): string[] => {
  const genreLabel = genres.slice(0, 2).join('، ')

  return [
    typeLabel,
    genreLabel || null,
    typeof rating === 'number' && Number.isFinite(rating) && rating > 0 ? `★ ${rating.toFixed(1)}` : null,
    year ? String(year) : null,
  ]
    .filter((item): item is string => Boolean(item && item.trim().length > 0))
}

const inferLinkQuality = (link: DetailActionLink): string => {
  const explicit = (link.quality || '').trim()
  if (explicit.length > 0) {
    return explicit.toUpperCase().replace('P', 'p')
  }

  const probe = `${link.label} ${link.url}`
  const match = probe.match(/(4k|2160p|1440p|1080p|720p|480p|360p|fhd|hd|sd)/i)
  if (!match) {
    return 'AUTO'
  }

  const normalized = match[1].toUpperCase()
  if (normalized === 'FHD') return '1080p'
  if (normalized === 'HD') return '720p'
  if (normalized === 'SD') return '480p'
  return normalized.replace('P', 'p')
}

const inferQualityFromSize = (sizeText: string): string | null => {
  const clean = sizeText.trim().toUpperCase()
  const sizeMatch = clean.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i)
  if (!sizeMatch) {
    return null
  }

  const value = Number.parseFloat(sizeMatch[1])
  const unit = sizeMatch[2].toUpperCase()
  const sizeInMb = unit === 'GB' ? value * 1024 : value

  if (sizeInMb >= 1500) return '1080p'
  if (sizeInMb >= 700) return '720p'
  if (sizeInMb >= 350) return '480p'
  return '360p'
}

const fallbackQualityByIndex = (index: number): string => {
  const ladder = ['1080p', '720p', '480p', '360p']
  return ladder[Math.min(index, ladder.length - 1)]
}

const ActionColumn = ({
  title,
  accent,
  links,
  hrefPrefix,
  hrefSuffix,
  hrefHash,
  emptyText,
}: {
  title: string
  accent: 'yellow' | 'violet'
  links: DetailActionLink[]
  hrefPrefix: '/watch?url=' | '/download?url='
  hrefSuffix?: string
  hrefHash?: string
  emptyText: string
}) => {
  const titleBarClass =
    accent === 'yellow'
      ? 'bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_62%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.45),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.22)]'
      : 'bg-[linear-gradient(180deg,#c8bcff_0%,#8e74ff_62%,#5f43d6_100%)] shadow-[0_0_24px_rgba(109,77,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_0_rgba(0,0,0,0.22)]'
  const iconShellClass =
    accent === 'yellow'
      ? 'border-[#f6c90e]/30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,232,138,0.3),rgba(246,201,14,0.1)_45%,rgba(255,255,255,0.03)_100%)] text-[#ffe278]'
      : 'border-[#8e74ff]/30 bg-[radial-gradient(circle_at_30%_30%,rgba(200,188,255,0.28),rgba(109,77,255,0.1)_45%,rgba(255,255,255,0.03)_100%)] text-[#d8d1ff]'
  const iconPulseClass = accent === 'yellow' ? 'bg-[#f6c90e]/20' : 'bg-[#8e74ff]/20'
  const iconPath = accent === 'yellow'
    ? 'M8 5v14l11-7z'
    : 'M12 3v10m0 0 4-4m-4 4-4-4m-5 7v2h18v-2'
  const iconStroke = accent === 'yellow'
    ? undefined
    : true
  const badgeClass =
    accent === 'yellow'
      ? 'border-[#f6c90e]/45 bg-[#f6c90e]/14 text-[#ffe278]'
      : 'border-[#6d4dff]/45 bg-[#6d4dff]/16 text-[#d1c8ff]'
  const rowGlowClass = accent === 'yellow' ? 'hover:shadow-[0_0_0_1px_rgba(246,201,14,0.18)]' : 'hover:shadow-[0_0_0_1px_rgba(109,77,255,0.2)]'

  let normalizedLinks = links.map((link, index) => {
    const hasExplicitQuality = (link.quality || '').trim().length > 0
    let quality = inferLinkQuality(link)
    const size = (link.size || '').trim()

    if (quality === 'AUTO') {
      const fromSize = inferQualityFromSize(size)
      if (fromSize) {
        quality = fromSize
      }
    }

    const source = (() => {
      try {
        const host = new URL(link.url).hostname.replace(/^www\./i, '')
        return host === 'go.ak.sv' ? 'Ak Server' : host
      } catch {
        return 'مصدر مباشر'
      }
    })()

    return { link, index, quality, size, source, hasExplicitQuality }
  })

  if (normalizedLinks.length > 1) {
    const hasAnyExplicitQuality = normalizedLinks.some((entry) => entry.hasExplicitQuality)

    // When qualities are not supplied by source, enforce a clear descending ladder.
    if (!hasAnyExplicitQuality) {
      normalizedLinks = normalizedLinks.map((entry, idx) => ({
        ...entry,
        quality: fallbackQualityByIndex(idx),
      }))
    }

    normalizedLinks = [...normalizedLinks]
      .sort((a, b) => getQualityRank(a.quality) - getQualityRank(b.quality))
      .map((entry, idx) => ({ ...entry, index: idx }))
  }

  const availableQualities = Array.from(
    new Set(
      normalizedLinks
        .map((entry) => entry.quality)
        .filter((value) => value.length > 0 && value !== 'AUTO')
    )
  )
    .sort((a, b) => {
      const rankDelta = getQualityRank(a) - getQualityRank(b)
      return rankDelta !== 0 ? rankDelta : a.localeCompare(b)
    })
    .slice(0, 6)
  const headerActionHref = normalizedLinks[0]
    ? `${hrefPrefix}${encodeURIComponent(normalizedLinks[0].link.url)}${hrefSuffix || ''}${hrefHash || ''}`
    : null
  const shouldShowQuality = normalizedLinks.length > 1
  const linksRowsStyle =
    normalizedLinks.length > 1
      ? ({ gridTemplateRows: `repeat(${normalizedLinks.length}, minmax(0, 1fr))` } as React.CSSProperties)
      : undefined

  return (
    <div className="flex h-full flex-col rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,17,30,0.92),rgba(10,10,18,0.72))] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center justify-between gap-3" style={{ paddingBottom: '50px' }}>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className={`h-10 w-2 shrink-0 rounded-full sm:h-12 ${titleBarClass}`} />
            <div className="text-right">
              <h3 className="section-title-emphasis font-[family-name:var(--font-cairo)] text-[24px] font-black leading-none text-white sm:text-[28px]">{title}</h3>
            </div>
          </div>

          {headerActionHref ? (
            <a
              href={headerActionHref}
              aria-label={title}
              className="relative flex h-12 w-12 items-center justify-center transition-transform duration-200 hover:scale-[1.06] sm:h-14 sm:w-14"
            >
              <span className={`absolute inset-0 rounded-full blur-[2px] motion-safe:animate-[glowPulse_2.4s_ease-in-out_infinite] ${iconPulseClass}`} />
              <span className={`absolute inset-[6px] rounded-full border ${iconShellClass}`} />
              <span className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm sm:h-11 sm:w-11 ${iconShellClass}`}>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill={iconStroke ? 'none' : 'currentColor'}
                  stroke={iconStroke ? 'currentColor' : 'none'}
                  strokeWidth={iconStroke ? '2' : undefined}
                  strokeLinecap={iconStroke ? 'round' : undefined}
                  strokeLinejoin={iconStroke ? 'round' : undefined}
                  aria-hidden="true"
                >
                  <path d={iconPath} />
                </svg>
              </span>
            </a>
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
              <span className={`absolute inset-0 rounded-full blur-[2px] motion-safe:animate-[glowPulse_2.4s_ease-in-out_infinite] ${iconPulseClass}`} />
              <span className={`absolute inset-[6px] rounded-full border ${iconShellClass}`} />
              <span className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm sm:h-11 sm:w-11 ${iconShellClass}`}>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill={iconStroke ? 'none' : 'currentColor'}
                  stroke={iconStroke ? 'currentColor' : 'none'}
                  strokeWidth={iconStroke ? '2' : undefined}
                  strokeLinecap={iconStroke ? 'round' : undefined}
                  strokeLinejoin={iconStroke ? 'round' : undefined}
                  aria-hidden="true"
                >
                  <path d={iconPath} />
                </svg>
              </span>
            </div>
          )}
        </div>

        {shouldShowQuality && availableQualities.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {availableQualities.map((quality) => (
              <span key={`${title}-${quality}`} className={`rounded-full border px-3 py-1 text-[11px] font-black ${badgeClass}`}>
                {quality}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid flex-1 gap-3" style={linksRowsStyle}>
        {normalizedLinks.length > 0 ? (
          normalizedLinks.map(({ link, index, quality, size, source }) => (
            <a
              key={`${link.url}-${index}`}
              href={`${hrefPrefix}${encodeURIComponent(link.url)}${hrefSuffix || ''}${hrefHash || ''}`}
              className={`group flex h-full flex-col justify-between rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 transition-all duration-200 hover:-translate-y-[2px] hover:border-white/25 ${rowGlowClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-[118px] flex-wrap items-center justify-start gap-2 pt-0.5">
                  {shouldShowQuality ? (
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${badgeClass}`}>
                      {quality === 'AUTO' ? fallbackQualityByIndex(index) : quality}
                    </span>
                  ) : null}
                  {normalizedLinks.length > 1 ? (
                    <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/72">
                      #{index + 1}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <p className="line-clamp-2 font-[family-name:var(--font-cairo)] text-[15px] font-black text-white">
                    {link.label || title}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-white/52">{source}</p>
                </div>
              </div>

              {size ? (
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/78">
                    {size}
                  </span>
                </div>
              ) : null}
            </a>
          ))
        ) : (
          <p className="py-5 text-center text-sm text-white/50">{emptyText}</p>
        )}
      </div>
    </div>
  )
}

export default function ContentDetailsPage(props: ContentDetailsPageProps) {
  const heroMetaItems = buildMetaItems(props.typeLabel, props.genres, props.rating, props.year)
  const heroBadge = props.genres[0] || props.typeLabel
  const hasWatchLinks = props.watchLinks.length > 0
  const hasDownloadLinks = props.downloadLinks.length > 0
  const hasAnyLinks = hasWatchLinks || hasDownloadLinks
  const prefilledParams = new URLSearchParams({
    title: props.title,
    poster: props.poster,
    description: props.description,
    typeLabel: props.typeLabel,
    genres: props.genres.join('|'),
    rating: typeof props.rating === 'number' && Number.isFinite(props.rating) ? String(props.rating) : '',
    year: props.year ? String(props.year) : '',
  })
  const prefilledSuffix = `&${prefilledParams.toString()}`

  return (
    <div className="app-shell min-h-screen bg-[#0a0620]" dir="rtl">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(108,82,255,0.35),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(245,197,24,0.2),transparent_68%)] blur-3xl" />
      </div>

      <div className="relative z-10">
        <section className="relative isolate min-h-[88vh] overflow-hidden font-[family-name:var(--font-cairo)]">
          <div
            className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${props.poster}')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-black/45" aria-hidden="true" />
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-[radial-gradient(circle_at_top_left,rgba(246,201,14,0.16),transparent_34%)]" aria-hidden="true" />
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-t from-[#0f0f10]/76 via-[#0f0f10]/32 to-[#0f0f10]/8" aria-hidden="true" />
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-r from-[#0f0f10]/74 via-[#0f0f10]/34 to-[#0f0f10]/16" aria-hidden="true" />

          <div className="relative z-10 mx-auto w-full max-w-[1540px] px-4 sm:px-8 lg:px-10">
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,26,0.44),rgba(12,12,20,0.24))] shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-[2px]">
              <div className="px-8 pt-8 sm:px-12 sm:pt-10 lg:px-20 lg:pt-12">
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/70">
                  {props.breadcrumbs.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                      {index > 0 ? <span className="text-white/35">‹</span> : null}
                      {item.href ? (
                        <Link href={item.href} className="transition hover:text-white">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-white">{item.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-h-[88vh] items-center gap-8 px-8 py-12 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 lg:px-20 lg:py-16">
                <div className="order-2 flex justify-center lg:order-2 lg:block lg:justify-self-end lg:translate-x-8">
                  <div className="relative aspect-[3/4] w-[220px] overflow-hidden rounded-[24px] border border-white/12 bg-[#111115] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:w-[260px] lg:w-[300px]">
                    <Image src={props.poster} alt={props.title} fill className="object-cover" quality={100} unoptimized sizes="300px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  </div>
                  <p className="mt-3 hidden text-center text-xl font-extrabold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:block">
                    {props.title}
                  </p>
                </div>

                <div className="order-1 hero-copy-reveal w-full max-w-[760px] text-right lg:order-1 lg:-translate-x-8 lg:justify-self-start lg:pt-16 lg:pr-20 xl:pr-24">
                  <div className="mb-[20px] flex justify-center sm:justify-end">
                  <span className="inline-flex min-w-[176px] items-center justify-center gap-3 rounded-[24px] border border-[rgba(245,197,24,0.42)] bg-[rgba(245,197,24,0.14)] px-[22px] py-[9px] text-[15px] font-black text-[#F5C518] shadow-[0_8px_20px_rgba(245,197,24,0.14)]">
                    <span className="hero-badge-dot" aria-hidden="true" />
                    <span>{heroBadge}</span>
                  </span>
                  </div>

                  <h1 className="mb-[18px] w-full max-w-[740px] text-[clamp(32px,6.2vw,84px)] font-black leading-[1.05] tracking-[-0.015em] text-white text-center sm:text-right" style={{ textShadow: '0 3px 24px rgba(0,0,0,0.52)' }}>
                    {props.title}
                  </h1>

                  {heroMetaItems.length > 0 ? (
                    <div className="mb-7 flex w-full max-w-[740px] flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-2.5 text-[16px] sm:text-[clamp(14px,1.1vw,20px)] font-bold text-white/88 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
                      {heroMetaItems.map((item, index) => (
                        <span key={`${item}-${index}`} className="inline-flex items-center gap-3 sm:gap-2">
                          {index > 0 ? <span className="text-white/45 text-[18px] sm:text-base leading-none">•</span> : null}
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="mb-8 max-w-[760px] text-[15px] leading-[1.95] text-white/72 sm:text-[17px] text-center sm:text-right">
                    {props.description}
                  </p>

                  <div className="mb-8 flex flex-wrap items-center justify-center sm:justify-end gap-3">
                    {!props.hideHeroWatchButton && props.watchLinks[0] ? (
                      <a href={`/watch?url=${encodeURIComponent(props.watchLinks[0].url)}${prefilledSuffix}#watch-player`} className="inline-flex min-w-[230px] items-center justify-center gap-3 rounded-[12px] bg-[#F5C518] px-[32px] py-[18px] text-[18px] font-black text-[#111111] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#FFD740] shadow-[0_12px_30px_rgba(245,197,24,0.3)]">
                        <span>شاهد الآن</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="flex max-w-[760px] flex-wrap justify-center sm:justify-end gap-2.5">
                    {props.genres.slice(0, 6).map((genre, index) => (
                      <span
                        key={`${genre}-${index}`}
                        className={`rounded-full border px-4 py-2 text-[13px] font-bold ${index === 0 ? 'border-[#f6c90e]/65 bg-[#f6c90e]/15 text-[#f6c90e]' : 'border-white/15 bg-white/[0.05] text-white/72'}`}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="soft-divider mx-6 my-12 sm:mx-10 lg:mx-16" />

        {!props.hideActionLinksSection && hasAnyLinks ? (
          <section className="content-right-gutter mt-16 px-3 py-14 sm:px-6 lg:mt-20 lg:px-10 lg:py-16">
            <div className="mx-auto max-w-[1660px]">
              <div className="mb-10 pt-3 text-right sm:mb-12 sm:pt-4 lg:pt-5">
                <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4" style={{ paddingTop: '34px', paddingBottom: '31px' }}>
                  <span className="inline-flex min-h-[38px] items-center justify-center rounded-[13px] border-2 border-[#ffe88a] bg-[linear-gradient(180deg,#ffe98d_0%,#f6c90e_52%,#d6a10a_100%)] px-4 py-2 font-[family-name:var(--font-cairo)] text-[13px] font-black leading-none tracking-[0.01em] text-[#2b1f00] shadow-[0_10px_18px_rgba(246,201,14,0.36),0_0_0_1px_rgba(100,70,0,0.28),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-2px_0_rgba(126,88,0,0.32)] sm:min-h-[42px] sm:px-5 sm:text-[14px]">
                    مباشرة
                  </span>
                  <h2 className="section-title-emphasis font-[family-name:var(--font-cairo)] text-[28px] font-black leading-none text-white [text-shadow:0_8px_22px_rgba(0,0,0,0.5)] sm:text-[36px]">المشاهدة والتحميل</h2>
                  <span className="h-11 w-2 shrink-0 rounded-full bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_60%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.56),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.22)] sm:h-14" />
                </div>
              </div>

              <div className={`grid grid-cols-1 items-stretch gap-8 ${hasWatchLinks && hasDownloadLinks ? 'lg:grid-cols-2' : 'max-w-[760px] mx-auto'}`}>
                {hasWatchLinks ? (
                  <ActionColumn
                    title="المشاهدة المباشرة"
                    accent="yellow"
                    links={props.watchLinks}
                    hrefPrefix="/watch?url="
                    hrefSuffix={prefilledSuffix}
                    hrefHash="#watch-player"
                    emptyText="لا توجد روابط مشاهدة متاحة حاليًا."
                  />
                ) : null}
                {hasDownloadLinks ? (
                  <ActionColumn
                    title="التحميل"
                    accent="violet"
                    links={props.downloadLinks}
                    hrefPrefix="/download?url="
                    hrefSuffix={prefilledSuffix}
                    hrefHash="#download-player"
                    emptyText="لا توجد روابط تحميل متاحة حاليًا."
                  />
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {props.extraSection}

        {props.recommendations.length > 0 ? (
          <CategorySection
            title="محتوى مشابه"
            content={props.recommendations}
            categoryPath={props.recommendationsPath}
            badge="مقترح"
            variant="featured"
            showSeeAll={false}
          />
        ) : null}

        <div className="h-28" />
      </div>
    </div>
  )
}
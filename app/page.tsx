'use client'

import { useEffect, useState } from 'react'
import CategorySection from '@/components/CategorySection'
import { mockFeatured, mockMovies, mockSeries, mockMiscellaneous, Content } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'

const HERO_ROTATION_MS = 6500

const hasDisplayValue = (value?: string | null): boolean => {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 && normalized !== 'غير محدد' && normalized !== 'n/a'
}

const inferHeroTypeLabel = (content: Content | null): string | null => {
  if (!content) {
    return null
  }

  const source = (content.sourceUrl || '').toLowerCase()
  const id = (content.id || '').toLowerCase()

  if (source.includes('/movie/') || id.startsWith('movie-') || id.startsWith('featured-')) return 'فيلم'
  if (source.includes('/series/') || source.includes('/episode/') || id.startsWith('series-')) return 'مسلسل'
  if (source.includes('/shows/') || id.startsWith('show-')) return 'برنامج'
  if (source.includes('/mix/')) return 'منوع'

  return null
}

export default function Home() {
  const router = useRouter()
  const [featured, setFeatured] = useState<Content[]>(mockFeatured)
  const [movies, setMovies] = useState<Content[]>(mockMovies)
  const [series, setSeries] = useState<Content[]>(mockSeries)
  const [shows, setShows] = useState<Content[]>(mockMiscellaneous)
  const [mix, setMix] = useState<Content[]>([])
  const [heroIndex, setHeroIndex] = useState(0)

  const heroItems = featured.slice(0, 5)
  const safeHeroIndex = heroItems.length > 0 ? heroIndex % heroItems.length : 0
  const currentHero = heroItems[safeHeroIndex] ?? featured[0] ?? null
  const currentHeroRating =
    currentHero && Number.isFinite(currentHero.rating) && currentHero.rating > 0
      ? currentHero.rating.toFixed(1)
      : null
  const heroTypeLabel = inferHeroTypeLabel(currentHero)
  const currentHeroGenre = hasDisplayValue(currentHero?.genre) ? currentHero?.genre?.trim() : null
  const heroYearLabel = currentHero?.year ? String(currentHero.year) : 'غير متاح'
  const heroGenres = currentHeroGenre
    ? currentHeroGenre
        .split(/[،,|/]/)
        .map((genre) => genre.trim())
        .filter((genre) => genre.length > 0)
        .slice(0, 4)
    : []
  const heroGenreLabel = heroGenres.slice(0, 2).join('، ')
  const heroTypeText = heroTypeLabel ? heroTypeLabel : null
  const heroMetaLine = [heroTypeText, heroGenreLabel || null, currentHeroRating ? `★ ${currentHeroRating}` : null, heroYearLabel]
    .filter((item): item is string => Boolean(item && item.trim().length > 0))
    .join(' • ')

  const heroMetaCards = [
    heroTypeText
      ? {
          label: heroTypeText,
          icon: '🎬',
          tone: 'border-[#f6c90e]/35 bg-[rgba(246,201,14,0.12)]',
        }
      : null,
    heroGenreLabel
      ? {
          label: heroGenreLabel,
          icon: '🔥',
          tone: 'border-[#ff9f43]/35 bg-[rgba(255,159,67,0.12)]',
        }
      : null,
    currentHeroRating
      ? {
          label: currentHeroRating,
          icon: '⭐',
          tone: 'border-[#8f7bff]/38 bg-[rgba(143,123,255,0.16)]',
        }
      : null,
    heroYearLabel
      ? {
          label: heroYearLabel,
          icon: '📅',
          tone: 'border-white/20 bg-white/[0.08]',
        }
      : null,
  ].filter((item): item is { label: string; icon: string; tone: string } => Boolean(item))


  const handleHeroWatch = () => {
    if (!currentHero) {
      return
    }

    const href = toLocalContentPath(currentHero.sourceUrl)
    if (href) {
      router.push(href)
    }
  }

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [homeResponse, mixResponse] = await Promise.all([
          fetch('/api/home', { cache: 'no-store' }),
          fetch('/api/mix/list?page=1', { cache: 'no-store' }),
        ])
        const data = await homeResponse.json()
        const mixData = await mixResponse.json()

        if (Array.isArray(data.featured) && data.featured.length > 0) setFeatured(data.featured)
        if (Array.isArray(data.movies) && data.movies.length > 0) setMovies(data.movies)
        if (Array.isArray(data.series) && data.series.length > 0) setSeries(data.series)
        if (Array.isArray(data.shows) && data.shows.length > 0) setShows(data.shows)
        if (Array.isArray(mixData.items) && mixData.items.length > 0) setMix(mixData.items)
      } catch (error) {
        console.error('Error fetching content:', error)
        // Keep showing mock data on error
      }
    }
    
    fetchAllData()
    
    // Refresh data frequently so new main-page items appear quickly
    const interval = setInterval(fetchAllData, 120000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (heroItems.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroItems.length)
    }, HERO_ROTATION_MS)

    return () => window.clearInterval(interval)
  }, [heroItems.length])

  return (
    <div className="app-shell min-h-screen bg-[#0a0620]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(108,82,255,0.35),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(245,197,24,0.2),transparent_68%)] blur-3xl" />
      </div>

      <div className="relative z-10">
      <section className="relative isolate min-h-[88vh] overflow-hidden font-[family-name:var(--font-cairo)]">
        <div
          key={currentHero?.id ?? 'hero-fallback-image'}
          className="hero-backdrop-zoom absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: currentHero?.image
              ? `url('${currentHero.image}')`
              : `url('https://image.tmdb.org/t/p/original/xgGGinKrl8ZBMkBQb4pBdB1lCOP.jpg')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-black/42" aria-hidden="true" />
        <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-[radial-gradient(circle_at_top_left,rgba(246,201,14,0.14),transparent_36%)]" aria-hidden="true" />
        <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-t from-[#0f0f10]/72 via-[#0f0f10]/28 to-[#0f0f10]/6" aria-hidden="true" />
        <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-r from-[#0f0f10]/68 via-[#0f0f10]/36 to-[#0f0f10]/14" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-[1540px] px-4 sm:px-8 lg:px-10">
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,16,26,0.44),rgba(12,12,20,0.24))] shadow-[0_30px_90px_rgba(0,0,0,0.34)] backdrop-blur-[2px]">
            <div className="grid min-h-[88vh] grid-rows-[1fr_auto] items-stretch gap-6 px-8 py-10 sm:px-12 sm:py-14 lg:grid-rows-none lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:gap-12 lg:px-20 lg:py-16">
              <div className="order-2 flex justify-center lg:order-2 lg:block lg:justify-self-end lg:translate-x-8">
                <div className="hero-copy-reveal relative aspect-[3/4] w-[220px] overflow-hidden rounded-[24px] border border-white/12 bg-[#111115] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:w-[260px] lg:w-[300px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.04]"
                style={{
                  backgroundImage: currentHero?.image
                    ? `url('${currentHero.image}')`
                    : `url('https://image.tmdb.org/t/p/original/xgGGinKrl8ZBMkBQb4pBdB1lCOP.jpg')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>
            {currentHero?.title ? (
              <p className="mt-3 hidden text-center text-xl font-extrabold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:block">
                {currentHero.title}
              </p>
            ) : null}
              </div>

              <div key={currentHero?.id ?? 'hero-fallback-copy'} className="order-1 hero-copy-reveal flex flex-col justify-between w-full max-w-[760px] text-right py-2 lg:block lg:order-1 lg:-translate-x-8 lg:justify-self-start lg:pt-16 lg:pr-20 xl:pr-24">

            <div className="mb-[20px] flex justify-center sm:justify-end hero-desktop-spacer1">
            <span className="inline-flex min-w-[176px] items-center justify-center gap-3 rounded-[24px] border border-[rgba(245,197,24,0.42)] bg-[rgba(245,197,24,0.14)] px-[22px] py-[9px] text-[15px] font-black text-[#F5C518] shadow-[0_8px_20px_rgba(245,197,24,0.14)]">
              <span className="hero-badge-dot" aria-hidden="true" />
              <span>أحدث الإضافات</span>
            </span>
            </div>

            {currentHero?.title ? (
              <h1
                className="mb-5 w-full max-w-[740px] text-[clamp(32px,6.2vw,84px)] font-black leading-[1.05] tracking-[-0.015em] text-white text-center sm:text-right hero-desktop-title-spacing hero-desktop-spacer2"
                style={{ textShadow: '0 3px 24px rgba(0,0,0,0.52)' }}
              >
                {currentHero.title}
              </h1>
            ) : null}

            <div className="mb-7 hidden w-full max-w-[740px] text-right lg:block hero-desktop-spacer3">
              <p
                className="font-[family-name:var(--font-cairo)] text-[clamp(14px,1.15vw,22px)] font-bold leading-[1.8] tracking-wide text-white/88 [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
              >
                {heroMetaLine}
              </p>
            </div>

            <div className="mb-6 w-full max-w-[740px] lg:hidden">
              <div key={(currentHero?.id ?? 'hero') + '-meta-cards'} className="hero-desc-reveal grid grid-cols-2 gap-2.5 px-1">
                {heroMetaCards.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className={`flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] border px-3 py-2 text-center ${item.tone}`}
                  >
                    <span className="text-[17px]" aria-hidden="true">{item.icon}</span>
                    <span className="font-[family-name:var(--font-cairo)] text-[14px] font-black leading-tight text-white/90">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full max-w-[740px] justify-center sm:justify-end hero-desktop-spacer4">
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleHeroWatch}
                className="inline-flex min-w-[230px] items-center justify-center gap-3 rounded-[12px] bg-[#F5C518] px-[32px] py-[18px] text-[18px] font-black text-[#111111] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#FFD740] shadow-[0_12px_30px_rgba(245,197,24,0.3)]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>شاهد الآن</span>
              </button>
            </div>

            {heroItems.length > 0 ? (
              <div className="mt-5 flex justify-center sm:justify-end">
                <div className="flex items-center gap-1.5">
                  {heroItems.map((item, index) => {
                    const isActive = index === safeHeroIndex

                    return (
                      <button
                        suppressHydrationWarning
                        key={item.id}
                        type="button"
                        onClick={() => setHeroIndex(index)}
                        aria-label={`عرض ${item.title}`}
                        title={item.title}
                        className={`rounded-full transition-all duration-300 ${
                          isActive
                            ? 'h-2 w-[22px] rounded-[4px] bg-[#F5C518]'
                            : 'h-2 w-2 bg-[rgba(255,255,255,0.20)] hover:bg-[rgba(255,255,255,0.4)]'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}

              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="soft-divider mx-6 my-12 sm:mx-10 lg:mx-16" />
      {featured.length > 0 && (
        <CategorySection title="احدث الاضافات" content={featured} categoryPath="/" badge="جديد" variant="featured" showSeeAll={false} />
      )}
      {movies.length > 0 && (
        <CategorySection title="افلام مميزة" content={movies} categoryPath="/movies" variant="featured" />
      )}
      {series.length > 0 && (
        <CategorySection title="المسلسلات العربية والعالمية" content={series} categoryPath="/series" variant="featured" />
      )}
      {shows.length > 0 && (
        <CategorySection title="العيد معنا احلى" content={shows} categoryPath="/shows" badge="حصري" variant="featured" />
      )}
      {mix.length > 0 && (
        <CategorySection title="مسابقات ومنوعات" content={mix} categoryPath="/miscellaneous" variant="featured" />
      )}
      <div className="h-28" />
      </div>
    </div>
  )
}


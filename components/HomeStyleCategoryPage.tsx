'use client'

import { useEffect, useRef, useState } from 'react'
import CategorySection from '@/components/CategorySection'
import { Content } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'
import ContentCard from '@/components/ContentCard'

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

interface HomeStyleCategoryPageProps {
  fetchUrl: string
  initialItems: Content[]
  heroBadgeLabel: string
  sectionTitle?: string
  sectionPath?: string
  sectionBadge?: string
  onNavigate?: (content: Content) => string | null
  paginationEnabled?: boolean
}

export default function HomeStyleCategoryPage({
  fetchUrl,
  initialItems,
  heroBadgeLabel,
  sectionTitle,
  sectionPath,
  sectionBadge,
  onNavigate,
  paginationEnabled = false,
}: HomeStyleCategoryPageProps) {
  const router = useRouter()
  const [items, setItems] = useState<Content[]>(initialItems)
  const [heroIndex, setHeroIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const isInitialMount = useRef(true)

  const heroItems = items.slice(0, 5)
  const safeHeroIndex = heroItems.length > 0 ? heroIndex % heroItems.length : 0
  const currentHero = heroItems[safeHeroIndex] ?? items[0] ?? null
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

    if (onNavigate) {
      const href = onNavigate(currentHero)
      if (href) {
        router.push(href)
      }
      return
    }

    const href = toLocalContentPath(currentHero.sourceUrl)
    if (href) {
      router.push(href)
    }
  }

  const handleCardClick = (content: Content) => {
    if (onNavigate) {
      const href = onNavigate(content)
      if (href) {
        router.push(href)
      }
      return
    }

    const href = toLocalContentPath(content.sourceUrl)
    if (href) {
      router.push(href)
    }
  }

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Preload hero images for faster rotation
  useEffect(() => {
    heroItems.slice(0, 5).forEach((item) => {
      if (item.image && typeof item.image === 'string') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = item.image
        link.fetchPriority = 'high'
        document.head.appendChild(link)
      }
    })
  }, [heroItems])

  useEffect(() => {
    const fetchItems = async () => {
      if (paginationEnabled) {
        setLoading(true)
      }

      try {
        const [basePath, query = ''] = fetchUrl.split('?')
        const params = new URLSearchParams(query)
        if (paginationEnabled) {
          params.set('page', String(page))
        }

        const endpoint = params.toString().length > 0 ? `${basePath}?${params.toString()}` : basePath
        const response = await fetch(endpoint, { cache: 'no-store' })
        const data = await response.json()

        if (Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items)
          if (paginationEnabled) {
            setTotalPages(data.totalPages || 1)
          }
          return
        }

        if (Array.isArray(data) && data.length > 0) {
          setItems(data)
        }
      } catch (error) {
        console.error('Error fetching category content:', error)
      } finally {
        if (paginationEnabled) {
          setLoading(false)
        }
      }
    }

    // Skip initial fetch on first mount if we already have items from SSR
    if (isInitialMount.current && initialItems.length > 0 && page === 1) {
      isInitialMount.current = false
      return
    }

    isInitialMount.current = false
    fetchItems()
  }, [fetchUrl, page, paginationEnabled, initialItems.length])

  useEffect(() => {
    if (heroItems.length <= 1) {
      return
    }

    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroItems.length)
    }, HERO_ROTATION_MS)

    return () => window.clearInterval(interval)
  }, [heroItems.length])

  useEffect(() => {
    if (paginationEnabled && page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [page, paginationEnabled])

  const buildPageButtons = (): number[] => {
    const windowStart = Math.max(1, page - 2)
    const windowEnd = Math.min(totalPages, page + 2)
    const pages = new Set<number>([1, totalPages])

    for (let p = windowStart; p <= windowEnd; p++) {
      pages.add(p)
    }

    return Array.from(pages).sort((a, b) => a - b)
  }

  const pageButtons = buildPageButtons()

  return (
    <div className="app-shell min-h-screen bg-[#0a0620]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(108,82,255,0.35),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(245,197,24,0.2),transparent_68%)] blur-3xl" />
      </div>

      <div className="relative z-10">
        <section
          className="relative isolate min-h-[88vh] overflow-hidden font-[family-name:var(--font-cairo)]"
          style={{ paddingBottom: '11px' }}
        >
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
                    <span>{heroBadgeLabel}</span>
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

        <div className="soft-divider mx-6 mt-12 mb-16 sm:mx-10 lg:mx-16" />

        {paginationEnabled ? (
          <div className="mx-auto w-full max-w-[1660px] px-3 pt-4 pb-12 sm:px-6 sm:pt-6 lg:px-10">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[#f6c90e]" />
              </div>
            ) : (
              <>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                      </svg>
                    </div>
                    <p className="text-base font-bold text-white/35">لا توجد عناصر متاحة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6">
                    {items.map((item, index) => (
                      <ContentCard key={item.id} content={item} priority={index < 4} onClick={handleCardClick} variant="featured" />
                    ))}
                  </div>
                )}

                <div className="mt-12 flex flex-col items-center gap-3" style={{ paddingTop: '60px' }}>
                  {isHydrated && totalPages > 1 ? (
                    <>
                      <div
                        suppressHydrationWarning
                        dir="rtl"
                        className="inline-flex flex-wrap items-center justify-center gap-2 rounded-[12px] bg-[#140734] px-3 py-2"
                      >
                        {pageButtons.map((pageNumber) => {
                          const isActive = pageNumber === page

                          return (
                            <button
                              suppressHydrationWarning
                              key={pageNumber}
                              aria-label={`الصفحة ${pageNumber}`}
                              className={`h-8 min-w-8 rounded-[8px] px-2 text-sm font-black leading-none tabular-nums transition-all duration-150 ${
                                isActive
                                  ? 'bg-[#ff4e45] text-white'
                                  : 'bg-[#2a2458] text-white/95 hover:bg-[#36306a]'
                              }`}
                              onClick={() => setPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-[86px] w-full" aria-hidden="true" />
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          items.length > 0 && sectionTitle && sectionPath && (
            <div className="pt-4 sm:pt-6">
              <CategorySection
                title={sectionTitle}
                content={items}
                categoryPath={sectionPath}
                badge={sectionBadge}
                variant="featured"
                showSeeAll={false}
              />
            </div>
          )
        )}

        <div className="h-28" />
      </div>
    </div>
  )
}

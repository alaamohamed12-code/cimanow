'use client'

import { useState, useEffect } from 'react'
import { Content } from '@/lib/mockData'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'

const HERO_ROTATION_MS = 6500

const hasDisplayValue = (value?: string | null): boolean => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 && normalized !== 'غير محدد' && normalized !== 'n/a'
}

interface CategoryHeroProps {
  items: Content[]
  badgeLabel: string
  onNavigate?: (content: Content) => void
}

export default function CategoryHero({ items, badgeLabel, onNavigate }: CategoryHeroProps) {
  const router = useRouter()
  const heroItems = items.slice(0, 5)
  const [heroIndex, setHeroIndex] = useState(0)

  const currentHero = heroItems[heroIndex] ?? heroItems[0] ?? null
  const currentHeroRating =
    currentHero && Number.isFinite(currentHero.rating) && currentHero.rating > 0
      ? currentHero.rating.toFixed(1)
      : null
  const currentHeroGenre = hasDisplayValue(currentHero?.genre) ? currentHero?.genre?.trim() : null
  const heroYearLabel = currentHero?.year ? String(currentHero.year) : ''
  const heroGenres = currentHeroGenre
    ? currentHeroGenre.split(/[،,|/]/).map((g) => g.trim()).filter((g) => g.length > 0).slice(0, 4)
    : []
  const sanitizedDescription = currentHero?.description?.trim()
    ? currentHero.description
        .trim()
        .replace(/مشاهدة\s*قائمتي/gi, '')
        .replace(/[<\-]{2,}/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim()
    : ''

  // Clamp heroIndex when items change
  useEffect(() => {
    if (heroItems.length > 0 && heroIndex >= heroItems.length) setHeroIndex(0)
  }, [heroIndex, heroItems.length])

  // Auto-rotate
  useEffect(() => {
    if (heroItems.length <= 1) return
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroItems.length)
    }, HERO_ROTATION_MS)
    return () => window.clearInterval(interval)
  }, [heroItems.length])

  const handleWatch = () => {
    if (!currentHero) return
    if (onNavigate) {
      onNavigate(currentHero)
    } else {
      const href = toLocalContentPath(currentHero.sourceUrl)
      if (href) router.push(href)
    }
  }

  if (!currentHero) return null

  return (
    <section className="relative isolate min-h-[72vh] overflow-hidden font-[family-name:var(--font-cairo)]">
      {/* Background image */}
      <div
        key={currentHero.id}
        className="hero-backdrop-zoom absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${currentHero.image}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(246,201,14,0.18),transparent_30%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/45 to-[#0f0f10]/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0f0f10]/88 via-[#0f0f10]/56 to-[#0f0f10]/22"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-[72vh] max-w-[1500px] grid-rows-[1fr_auto] items-stretch gap-6 px-6 py-10 sm:px-10 sm:py-14 lg:grid-rows-none lg:grid-cols-[minmax(0,1fr)_290px] lg:items-center lg:gap-12 lg:px-16">
        {/* ── Poster frame ── */}
        <div className="order-2 flex justify-center lg:order-2 lg:block lg:justify-self-end">
          <div className="hero-copy-reveal relative mx-auto aspect-[3/4] w-[190px] overflow-hidden rounded-[22px] border border-white/12 bg-[#111115] shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:w-[230px] lg:w-[260px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.04]"
              style={{ backgroundImage: `url('${currentHero.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
          {currentHero.title && (
            <p className="mt-3 hidden text-center text-lg font-extrabold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] sm:block">
              {currentHero.title}
            </p>
          )}
        </div>

        {/* ── Text block ── */}
        <div
          key={currentHero.id + '-copy'}
          className="order-1 hero-copy-reveal flex flex-col justify-between w-full max-w-[520px] text-right py-2 lg:block lg:order-1 lg:justify-self-start lg:pt-10 lg:pr-16 xl:pr-20 lg:mr-6"
        >
          {/* Badge */}
          <div className="mb-5 flex justify-center sm:justify-end">
          <span className="inline-flex items-center gap-2.5 rounded-[20px] border border-[rgba(245,197,24,0.35)] bg-[rgba(245,197,24,0.12)] px-[16px] py-[5px] text-[13px] font-bold text-[#F5C518]">
            <span className="hero-badge-dot" aria-hidden="true" />
            <span>{badgeLabel}</span>
          </span>
          </div>

          {/* Title */}
          {currentHero.title && (
            <h2
              className="mb-4 w-full text-[clamp(28px,4.2vw,50px)] font-black leading-[1.1] text-white text-center sm:text-right"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              {currentHero.title}
            </h2>
          )}

          {/* Meta row */}
          <div className="mb-[14px] flex flex-wrap items-center justify-center sm:justify-end gap-[10px]">
            {heroYearLabel && (
              <span className="text-[13px] font-semibold text-[#8A8A9A]">{heroYearLabel}</span>
            )}
            {currentHeroRating && (
              <>
                <span className="text-[12px] text-[#333]" aria-hidden="true">&middot;</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#F5C518]">
                  <span aria-hidden="true">★</span>
                  <span>{currentHeroRating}</span>
                </span>
              </>
            )}
            {heroGenres.map((genre) => (
              <span
                key={genre}
                className="rounded-[20px] border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.07)] px-[10px] py-[2px] text-[11px] text-[#8A8A9A]"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Description */}
          {sanitizedDescription && (
            <p
              key={currentHero.id + '-desc'}
              className="hero-desc-reveal mb-6 max-w-[430px] text-[14px] leading-[2.1] text-white/62 text-center sm:text-right mx-auto sm:mx-0"
            >
              {sanitizedDescription.length > 115
                ? `${sanitizedDescription.slice(0, 115)}...`
                : sanitizedDescription}
            </p>
          )}

          {/* Watch button */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-[10px]">
            <button
              type="button"
              onClick={handleWatch}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#F5C518] px-[22px] py-[11px] text-[14px] font-bold text-[#111111] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#FFD740]"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>شاهد الآن</span>
            </button>
          </div>

          {/* Rotation dots */}
          {heroItems.length > 1 && (
            <div className="mt-5 flex justify-center sm:justify-end">
              <div className="flex items-center gap-1.5">
                {heroItems.map((item, index) => {
                  const isActive = index === heroIndex
                  return (
                    <button
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
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'
import { Content } from '@/lib/mockData'
import { useState } from 'react'
import React from 'react'

const hasDisplayValue = (value?: string | null): boolean => {
  if (!value) {
    return false
  }

  const normalized = value.trim().toLowerCase()
  return normalized.length > 0 && normalized !== 'غير محدد' && normalized !== 'n/a'
}

interface ContentCardProps {
  content: Content
  onClick?: (content: Content) => void
  priority?: boolean
  variant?: 'default' | 'featured'
}

const inferQualityBadge = (content: Content): string => {
  const probe = `${content.title} ${content.description} ${content.sourceUrl ?? ''}`.toLowerCase()

  if (probe.includes('2160') || probe.includes('4k')) return '4K'
  if (probe.includes('1080') || content.rating >= 8) return '1080p'
  if (probe.includes('web-dl')) return 'WEB-DL'

  return '720p'
}

const inferLanguageBadge = (content: Content): string | null => {
  const probe = `${content.title} ${content.description}`.toLowerCase()

  if (probe.includes('مدبلج') || probe.includes('dub')) return 'مدبلج'
  if (probe.includes('مترجم') || probe.includes('sub')) return 'مترجم'
  if (probe.includes('بالألوان')) return 'بالألوان'

  return null
}

const inferEpisodeLabel = (content: Content): string | null => {
  const match = content.title.match(/(?:الحلقة|حلقة|episode|ep)\s*([0-9]{1,3})/i)
  if (match?.[1]) {
    return match[1]
  }

  const source = (content.sourceUrl || '').toLowerCase()
  if (source.includes('/episode/')) {
    const tail = source.match(/(\d{1,3})(?!.*\d)/)
    if (tail?.[1]) {
      return tail[1]
    }
  }

  return null
}

const inferTypeBadge = (content: Content): string | null => {
  const source = (content.sourceUrl || '').toLowerCase()
  const id = (content.id || '').toLowerCase()

  if (source.includes('/movie/') || id.startsWith('movie-') || id.startsWith('featured-')) return 'فيلم'
  if (source.includes('/series/') || source.includes('/episode/') || id.startsWith('series-')) return 'مسلسل'
  if (source.includes('/shows/') || id.startsWith('show-')) return 'برنامج'
  if (source.includes('/mix/')) return 'منوع'

  return null
}

const inferGenreFallback = (content: Content): string | null => {
  const probe = `${content.genre ?? ''} ${content.title ?? ''} ${content.description ?? ''}`.toLowerCase()

  const genreHints: Array<{ label: string; patterns: string[] }> = [
    { label: 'أكشن', patterns: ['اكشن', 'أكشن', 'action'] },
    { label: 'رعب', patterns: ['رعب', 'horror'] },
    { label: 'دراما', patterns: ['دراما', 'drama'] },
    { label: 'كوميدي', patterns: ['كوميدي', 'كوميديا', 'comedy'] },
    { label: 'رومانسي', patterns: ['رومانسي', 'romance'] },
    { label: 'أنمي', patterns: ['انمي', 'أنمي', 'anime'] },
    { label: 'جريمة', patterns: ['جريمة', 'crime'] },
    { label: 'غموض', patterns: ['غموض', 'mystery'] },
    { label: 'خيال علمي', patterns: ['خيال علمي', 'science fiction', 'sci-fi'] },
    { label: 'فانتازيا', patterns: ['فانتازيا', 'fantasy'] },
    { label: 'إثارة', patterns: ['اثارة', 'إثارة', 'thriller'] },
    { label: 'مغامرة', patterns: ['مغامرة', 'adventure'] },
    { label: 'تاريخي', patterns: ['تاريخي', 'history', 'historical'] },
    { label: 'حربي', patterns: ['حربي', 'war'] },
    { label: 'وثائقي', patterns: ['وثائقي', 'documentary'] },
    { label: 'عائلي', patterns: ['عائلي', 'family'] },
  ]

  for (const hint of genreHints) {
    if (hint.patterns.some((pattern) => probe.includes(pattern.toLowerCase()))) {
      return hint.label
    }
  }

  return null
}

function ContentCard({ content, onClick, priority = false, variant = 'default' }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const displayGenre = hasDisplayValue(content.genre) ? content.genre.trim() : null
  const typeBadge = inferTypeBadge(content)
  const qualityBadge = inferQualityBadge(content)
  const languageBadge = inferLanguageBadge(content)
  const episodeLabel = inferEpisodeLabel(content)
  const releaseYear = content.year ? String(content.year) : null
  const classificationBadge = languageBadge ?? typeBadge ?? qualityBadge
  const hoverGenre = displayGenre ?? inferGenreFallback(content)
  const hasRating = typeof content.rating === 'number' && Number.isFinite(content.rating) && content.rating > 0

  const fallbackImage = '/images/poster-placeholder.svg'
  const imageUrl = imageError || !content.image ? fallbackImage : content.image
  const useRawImage =
    imageUrl.startsWith('data:') ||
    imageUrl.startsWith('http') ||
    imageUrl.startsWith('/api/image-proxy?')
  const isFeatured = variant === 'featured'

  return (
    <div
      className="group relative w-full aspect-[2/3] cursor-pointer overflow-visible"
      style={{
        boxShadow: isHovered
          ? isFeatured
            ? '0 22px 40px rgba(0,0,0,0.48), 0 0 0 1px rgba(255,255,255,0.22)'
            : '0 26px 46px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.18)'
          : '0 10px 20px rgba(0,0,0,0.35)',
        transform: isHovered ? (isFeatured ? 'translateY(-3px) scale(1.008)' : 'translateY(-6px) scale(1.012)') : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(content)}
    >
      <div
        className={`relative h-full w-full overflow-hidden bg-[#121221] ${isFeatured ? 'rounded-[18px] border border-[rgba(255,255,255,0.11)]' : 'rounded-[14px] border border-[rgba(255,255,255,0.08)]'}`}
      >
        <Image
          src={imageUrl}
          alt={content.title}
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 29vw, 210px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          priority={priority}
          quality={85}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          unoptimized={useRawImage}
        />

        <div className={`absolute inset-0 ${isFeatured ? 'bg-gradient-to-t from-[#090812]/90 via-[#0b0a16]/22 to-transparent' : 'bg-gradient-to-t from-[#090812]/97 via-[#0b0a16]/48 to-transparent'}`} />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'rgba(4,4,10,0.34)' }}
        >
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(245,197,24,0.93)] shadow-[0_8px_20px_rgba(245,197,24,0.4)]">
              <svg className="w-5 h-5 text-[#111] mr-[-1px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-cairo)] font-black text-[16px] sm:text-[18px] leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {content.title}
              </h3>
              {hoverGenre && (
                <p className="font-[family-name:var(--font-cairo)] text-[12px] sm:text-[13px] text-[#f6c90e] font-semibold">
                  {hoverGenre}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 border-t border-white/10 px-4 pb-4 backdrop-blur-[1.5px] ${isFeatured ? 'bg-[linear-gradient(180deg,rgba(8,8,14,0),rgba(8,8,14,0.72))] pt-20' : 'bg-[linear-gradient(180deg,rgba(8,8,14,0.2),rgba(8,8,14,0.75))] pt-16'}`}>
          <div className={`flex items-center justify-between text-white/95 ${isFeatured ? 'text-[12px]' : 'text-[13px]'}`}>
            {episodeLabel ? (
              isFeatured ? (
                <div className="mr-auto flex items-end gap-2">
                  <span className="rounded-[9px] bg-[#7b56ff] px-2 py-1 text-[14px] font-black leading-none text-white">الحلقة</span>
                  <span className="text-[47px] font-black leading-[0.84] text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.62)]">{episodeLabel}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#6c52ff] px-2.5 py-1.5 leading-none shadow-[0_8px_20px_rgba(108,82,255,0.35)]">
                  <span className="text-[11px] font-semibold text-white/90">الحلقة</span>
                  <span className="text-[13px] font-black text-white">{episodeLabel}</span>
                </div>
              )
            ) : (
              <span />
            )}
            <span className={`font-black ${isFeatured ? 'text-[40px] text-white/92 drop-shadow-[0_8px_16px_rgba(0,0,0,0.62)]' : 'text-[#F5C518] [text-shadow:0_0_14px_rgba(245,197,24,0.28)]'}`}>
              {isFeatured ? '' : hasRating ? `★ ${content.rating.toFixed(1)}` : ''}
            </span>
          </div>
        </div>
      </div>

      {classificationBadge ? (
        <div className="pointer-events-none absolute left-0 top-2.5 z-20">
          <span className="relative inline-flex min-h-[30px] min-w-[74px] items-center justify-center rounded-r-[10px] bg-[#6d4dff] px-5 py-1 text-center font-[family-name:var(--font-cairo)] text-[13px] font-black leading-none text-white shadow-[0_8px_16px_rgba(86,62,214,0.48)]">
            {classificationBadge}
            <span
              aria-hidden="true"
              className="absolute -bottom-[8px] left-0 h-0 w-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-[#4c35bf]"
            />
          </span>
        </div>
      ) : null}

      {releaseYear ? (
        <div className={`pointer-events-none absolute right-2 top-2 z-20 min-w-[58px] rounded-full bg-[#ffcc17] px-3 py-1.5 text-center font-[family-name:var(--font-cairo)] font-black leading-none text-[#141100] shadow-[0_8px_18px_rgba(255,204,23,0.46)] ${isFeatured ? 'text-[15px]' : 'text-[13px]'}`}>
          {releaseYear}
        </div>
      ) : null}
    </div>
  )
}

export default React.memo(ContentCard, (prevProps, nextProps) => {
  return (
    prevProps.content.id === nextProps.content.id &&
    prevProps.priority === nextProps.priority &&
    prevProps.variant === nextProps.variant &&
    prevProps.onClick === nextProps.onClick
  )
})

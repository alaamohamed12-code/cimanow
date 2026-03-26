'use client'

import { Content } from '@/lib/mockData'
import ContentCard from './ContentCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'
import { useRef } from 'react'

interface CategorySectionProps {
  title: string
  content: Content[]
  categoryPath: string
  index?: number
  badge?: string
  variant?: 'default' | 'featured'
  showSeeAll?: boolean
}

export default function CategorySection({
  title,
  content,
  categoryPath,
  badge,
  variant = 'default',
  showSeeAll = true,
}: CategorySectionProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCardClick = (item: Content) => {
    const href = toLocalContentPath(item.sourceUrl)
    if (href) router.push(href)
  }

  const scroll = (dir: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: 'smooth' })
  }

  const isFeatured = variant === 'featured'

  return (
    <section className={`content-right-gutter mt-16 px-3 py-10 sm:px-6 lg:mt-20 lg:px-10 lg:py-14 first:mt-0 ${isFeatured ? 'pb-8 pt-8' : ''}`}>
      <div className="mx-auto max-w-[1660px]">

        <div
          className={`flex items-center justify-between gap-4 ${isFeatured ? '' : 'mb-11 sm:mb-12'}`}
          style={isFeatured ? { marginTop: '1cm', marginBottom: '1cm' } : { marginTop: '1cm' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="h-11 w-2 shrink-0 rounded-full bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_60%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.56),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.22)] sm:h-14" />
            <h2 className={`section-title-emphasis font-[family-name:var(--font-cairo)] font-black leading-none text-white [text-shadow:0_8px_22px_rgba(0,0,0,0.5)] ${isFeatured ? 'text-[34px] sm:text-[52px]' : 'text-[27px] sm:text-[36px]'}`}>{title}</h2>
            {badge && (
              <span className="inline-flex min-h-[38px] items-center justify-center rounded-[13px] border-2 border-[#ffe88a] bg-[linear-gradient(180deg,#ffe98d_0%,#f6c90e_52%,#d6a10a_100%)] px-4 py-2 font-[family-name:var(--font-cairo)] text-[13px] font-black leading-none tracking-[0.01em] text-[#2b1f00] shadow-[0_10px_18px_rgba(246,201,14,0.36),0_0_0_1px_rgba(100,70,0,0.28),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-2px_0_rgba(126,88,0,0.32)] motion-safe:animate-[sectionBadgeBreathe_2.8s_ease-in-out_infinite] sm:min-h-[42px] sm:px-5 sm:text-[14px]">
                {badge}
              </span>
            )}
          </div>

          {showSeeAll && (
            <Link
              href={categoryPath}
              className={`ml-[0.5cm] shrink-0 rounded-full border-[2.5px] px-6 py-2.5 font-[family-name:var(--font-cairo)] text-[16px] font-extrabold transition-all duration-200 sm:px-7 sm:text-[17px] ${isFeatured ? 'border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(0,0,0,0.28))] text-white shadow-[0_12px_22px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.38)] hover:-translate-y-[1px] hover:border-white/58 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(0,0,0,0.32))]' : 'border-[#f6c90e]/68 bg-[linear-gradient(180deg,rgba(246,201,14,0.26),rgba(246,201,14,0.1))] text-[#ffe27c] shadow-[0_12px_24px_rgba(246,201,14,0.2),inset_0_1px_0_rgba(255,246,199,0.52)] hover:-translate-y-[1px] hover:border-[#ffe27c]/85 hover:bg-[linear-gradient(180deg,rgba(246,201,14,0.34),rgba(246,201,14,0.14))]'}`}
            >
              شاهد الكل
            </Link>
          )}
        </div>

        <div className={`relative group/row ${isFeatured ? 'px-0 py-1' : 'rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-1 py-3 sm:px-2 sm:py-3.5'}`}>
          <button
            suppressHydrationWarning
            onClick={() => scroll(1)}
            className="absolute right-1 top-1/2 z-10 hidden h-16 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-[#0f0f18]/88 text-white/70 opacity-0 shadow-lg transition-all duration-200 hover:bg-[#1a1a25] hover:text-white group-hover/row:opacity-100 md:flex"
            aria-label="السابق"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className={`hide-scrollbar flex overflow-x-auto ${isFeatured ? 'gap-3.5 px-0 py-2 sm:gap-4.5' : 'gap-3 px-2 py-3 sm:gap-4 sm:px-3 sm:py-4'}`}
          >
            {content.slice(0, 16).map((item, i) => (
              <div
                key={item.id}
                className={isFeatured ? 'w-[228px] shrink-0 sm:w-[242px] md:w-[258px] lg:w-[286px]' : 'w-[175px] shrink-0 sm:w-[188px] md:w-[205px] lg:w-[214px]'}
              >
                <ContentCard content={item} priority={i === 0} onClick={handleCardClick} variant={isFeatured ? 'featured' : 'default'} />
              </div>
            ))}
          </div>

          <button
            suppressHydrationWarning
            onClick={() => scroll(-1)}
            className="absolute left-1 top-1/2 z-10 hidden h-16 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-[#0f0f18]/88 text-white/70 opacity-0 shadow-lg transition-all duration-200 hover:bg-[#1a1a25] hover:text-white group-hover/row:opacity-100 md:flex"
            aria-label="التالي"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}


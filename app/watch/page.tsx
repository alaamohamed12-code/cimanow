'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContentDetailsPage from '@/components/ContentDetailsPage'

interface VideoSource {
  src: string
  size: string
  type: string
}

interface QualityOption {
  label: string
  tabId: string
  watchUrl: string
  downloadUrl: string
  size?: string
  videoSrc?: string
}

interface WatchData {
  title: string
  poster: string
  watchPageUrl: string
  qualities: QualityOption[]
  videoSources: VideoSource[]
}

const COUNTDOWN = 15
const RING_R = 54
const CIRCUMFERENCE = 2 * Math.PI * RING_R

const stripTitlePrefix = (value: string): string => {
  return value.replace(/^\s*(فيلم|مسلسل|برنامج|الحلقة)\s+/u, '').trim()
}

const toProxyPoster = (rawPoster?: string): string => {
  if (!rawPoster) return '/images/poster-placeholder.svg'
  if (rawPoster.startsWith('/api/image-proxy') || rawPoster.startsWith('/images/')) return rawPoster
  return `/api/image-proxy?url=${encodeURIComponent(rawPoster)}`
}

function WatchInner() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url') ?? ''
  const preTitle = searchParams.get('title') ?? ''
  const prePoster = searchParams.get('poster') ?? ''
  const preDescription = searchParams.get('description') ?? ''
  const preTypeLabel = searchParams.get('typeLabel') ?? ''
  const preGenres = (searchParams.get('genres') || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
  const preRatingRaw = Number.parseFloat(searchParams.get('rating') || '')
  const preYearRaw = Number.parseInt(searchParams.get('year') || '', 10)
  const preRating = Number.isFinite(preRatingRaw) ? preRatingRaw : undefined
  const preYear = Number.isFinite(preYearRaw) ? preYearRaw : undefined
  const invalidUrl = !url

  const [sec, setSec] = useState(COUNTDOWN)
  const [done, setDone] = useState(false)
  const [data, setData] = useState<WatchData | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!url) return

    fetch(`/api/watch?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d: WatchData & { error?: string }) => {
        if (d.error) {
          setLoadErr(d.error)
          return
        }

        setData(d)
      })
      .catch((e) => setLoadErr(String(e)))
  }, [url])

  const pageError = invalidUrl ? 'رابط المشاهدة غير صالح.' : loadErr
  const rawTitle = data?.title || preTitle || 'المشاهدة المباشرة'
  const displayTitle = stripTitlePrefix(rawTitle)

  const activeQuality = data?.qualities[activeIdx] ?? data?.qualities[0]
  const currentVideoSrc = activeQuality?.videoSrc ?? data?.videoSources[0]?.src ?? ''

  useEffect(() => {
    if (!done || !videoRef.current || !currentVideoSrc) return

    videoRef.current.play().catch(() => {
      // Ignore autoplay rejection and allow manual play.
    })
  }, [done, currentVideoSrc])

  const watchLinks = useMemo(() => {
    if (!data) return []

    return data.qualities
      .filter((q) => Boolean(q.watchUrl || q.videoSrc))
      .map((q, idx) => ({
        label: `مشاهدة ${q.label || `#${idx + 1}`}`,
        url: q.watchUrl || q.videoSrc || '',
        quality: q.label || undefined,
        size: q.size,
      }))
      .filter((link) => Boolean(link.url))
  }, [data])

  const downloadLinks = useMemo(() => {
    if (!data) return []

    return data.qualities
      .filter((q) => Boolean(q.downloadUrl || q.videoSrc))
      .map((q, idx) => ({
        label: `تحميل ${q.label || `#${idx + 1}`}`,
        url: q.downloadUrl || q.videoSrc || '',
        quality: q.label || undefined,
        size: q.size,
      }))
      .filter((link) => Boolean(link.url))
  }, [data])

  const qualityTags = preGenres.length > 0
    ? preGenres.slice(0, 6)
    : data
      ? (() => {
          const tags = Array.from(new Set(data.qualities.map((q) => q.label).filter(Boolean)))
          return tags.length > 0 ? tags.slice(0, 6) : ['مشاهدة مباشرة']
        })()
      : ['مشاهدة مباشرة']

  const progress = ((COUNTDOWN - sec) / COUNTDOWN) * 100
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE
  const posterSrc = toProxyPoster(prePoster || data?.poster)
  const descriptionText =
    preDescription ||
    'صفحة المشاهدة بنفس تنسيق صفحة المحتوى، مع عدّاد 15 ثانية قبل التشغيل التلقائي.'

  const extraSection = (
    <section id="watch-player" className="content-balanced-gutter mt-16 scroll-mt-28 px-3 py-14 sm:px-6 lg:mt-20 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1660px]">
        <div className="mb-10 pt-3 text-right sm:mb-12 sm:pt-4 lg:pt-5">
          <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4" style={{ paddingTop: '34px', paddingBottom: '31px' }}>
            <span className="inline-flex min-h-[38px] items-center justify-center rounded-[13px] border-2 border-[#ffe88a] bg-[linear-gradient(180deg,#ffe98d_0%,#f6c90e_52%,#d6a10a_100%)] px-4 py-2 font-[family-name:var(--font-cairo)] text-[13px] font-black leading-none tracking-[0.01em] text-[#2b1f00] shadow-[0_10px_18px_rgba(246,201,14,0.36),0_0_0_1px_rgba(100,70,0,0.28),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-2px_0_rgba(126,88,0,0.32)] sm:min-h-[42px] sm:px-5 sm:text-[14px]">
              مباشر
            </span>
            <h2 className="section-title-emphasis font-[family-name:var(--font-cairo)] text-[28px] font-black leading-none text-white [text-shadow:0_8px_22px_rgba(0,0,0,0.5)] sm:text-[36px]">
              المشغل
            </h2>
            <span className="h-11 w-2 shrink-0 rounded-full bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_60%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.56),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.22)] sm:h-14" />
          </div>
        </div>

        <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,17,30,0.92),rgba(10,10,18,0.72))] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.35)] sm:p-6">
          {pageError ? (
            <div className="rounded-2xl border border-rose-400/35 bg-rose-500/10 p-5 text-center space-y-3">
              <p className="text-rose-200">تعذّر تحميل بيانات المشغّل</p>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-lg bg-[#f6c90e] px-5 py-2 text-sm font-bold text-[#101114] hover:bg-[#ffd84b]"
                >
                  فتح رابط المشاهدة ↗
                </a>
              ) : null}
            </div>
          ) : !data ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-[22px] border border-white/10 bg-[#121318]/90">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f6c90e] border-t-transparent" />
              <p className="text-white/55">جارٍ تجهيز المشغّل...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#090a0f] shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#111319] px-4 py-3 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">{activeQuality?.label || 'AUTO'}</span>
                    <span className="rounded-full border border-[#f6c90e]/25 bg-[#f6c90e]/10 px-3 py-1 text-xs font-semibold text-[#f6c90e]">Cinema Player</span>
                  </div>
                </div>

                <div className="relative aspect-video bg-black">
                  {currentVideoSrc ? (
                    <>
                      <video
                        ref={videoRef}
                        key={currentVideoSrc}
                        controls
                        playsInline
                        autoPlay={done}
                        className="h-full w-full"
                      >
                        <source src={currentVideoSrc} type="video/mp4" />
                        <p className="p-4 text-gray-300">متصفّحك لا يدعم مشغّل الفيديو.</p>
                      </video>

                      {!done ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#06070c]/72 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#f6c90e]/20 bg-[#111319]/92 px-8 py-7 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                            <div className="relative h-28 w-28">
                              <svg width="112" height="112" viewBox="0 0 128 128" className="h-full w-full" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="64" cy="64" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                <circle
                                  cx="64"
                                  cy="64"
                                  r={RING_R}
                                  fill="none"
                                  stroke="#f6c90e"
                                  strokeWidth="10"
                                  strokeLinecap="round"
                                  strokeDasharray={CIRCUMFERENCE}
                                  strokeDashoffset={dashOffset}
                                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black tabular-nums text-white">{sec}</span>
                              </div>
                            </div>
                            <p className="text-center text-sm text-white/60">سيبدأ التشغيل تلقائيًا بعد انتهاء العداد</p>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(246,201,14,0.14),transparent_45%),linear-gradient(180deg,#0f1015_0%,#090a0f_100%)] p-6 text-center">
                      <div className="max-w-md space-y-4">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#f6c90e]/25 bg-[#f6c90e]/10 text-3xl text-[#f6c90e]">▶</div>
                        <h3 className="text-xl font-bold text-white">لم يتم العثور على مصدر فيديو مباشر</h3>
                        <a
                          href={data.watchPageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block rounded-lg bg-[#f6c90e] px-5 py-2.5 text-sm font-bold text-[#101114] hover:bg-[#ffd84b]"
                        >
                          فتح صفحة المشاهدة ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {data.qualities.length > 1 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.qualities.map((q, idx) => {
                    const isActive = idx === activeIdx

                    return (
                      <button
                        key={`${q.tabId}-${idx}`}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={`rounded-2xl border p-4 text-right transition ${
                          isActive
                            ? 'border-[#f6c90e]/50 bg-[#f6c90e]/10'
                            : 'border-white/10 bg-[#121318] hover:border-white/20'
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isActive ? 'bg-[#f6c90e] text-[#111]' : 'bg-white/[0.06] text-white/70'}`}>
                            {q.label || `#${idx + 1}`}
                          </span>
                          {isActive ? <span className="text-xs font-semibold text-[#f6c90e]">الحالية</span> : null}
                        </div>
                        <div className="text-sm font-bold text-white">{q.size || 'حجم غير محدد'}</div>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )

  return (
    <ContentDetailsPage
      title={displayTitle}
      poster={posterSrc}
      description={descriptionText}
      rating={preRating}
      year={preYear}
      genres={qualityTags}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'المشاهدة المباشرة' },
      ]}
      watchLinks={watchLinks}
      downloadLinks={downloadLinks}
      recommendations={[]}
      recommendationsPath="/"
      typeLabel={preTypeLabel || 'مشاهدة'}
      hideHeroWatchButton
      hideActionLinksSection
      extraSection={extraSection}
    />
  )
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f1015] flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f6c90e] border-t-transparent" />
        </div>
      }
    >
      <WatchInner />
    </Suspense>
  )
}

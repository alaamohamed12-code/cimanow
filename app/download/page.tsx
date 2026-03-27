'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
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

interface DownloadExperienceProps {
  url: string
  preTitle: string
  prePoster: string
  preDescription: string
  preTypeLabel: string
  preGenres: string[]
  preRating?: number
  preYear?: number
}

const COUNTDOWN = 15
const RING_R = 54
const CIRCUMFERENCE = 2 * Math.PI * RING_R

const toProxyPoster = (rawPoster?: string): string => {
  if (!rawPoster) return '/images/poster-placeholder.svg'
  if (rawPoster.startsWith('/api/image-proxy') || rawPoster.startsWith('/images/')) return rawPoster
  return `/api/image-proxy?url=${encodeURIComponent(rawPoster)}`
}

function DownloadExperience({
  url,
  preTitle,
  prePoster,
  preDescription,
  preTypeLabel,
  preGenres,
  preRating,
  preYear,
}: DownloadExperienceProps) {
  const invalidUrl = !url
  const [sec, setSec] = useState(COUNTDOWN)
  const [done, setDone] = useState(false)
  const [data, setData] = useState<WatchData | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [downloadStarted, setDownloadStarted] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          setDone(true)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!url) return

    const controller = new AbortController()

    fetch(`/api/watch?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as WatchData & { error?: string }
        if (!response.ok || payload.error) {
          throw new Error(payload.error || 'تعذر تحميل بيانات التحميل.')
        }
        setData(payload)
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return
        setLoadErr(error.message)
      })

    return () => controller.abort()
  }, [url])

  const watchLinks = useMemo(() => {
    if (!data) return []

    return data.qualities
      .filter((quality) => Boolean(quality.watchUrl || quality.videoSrc))
      .map((quality, idx) => ({
        label: `مشاهدة ${quality.label || `#${idx + 1}`}`,
        url: quality.watchUrl || quality.videoSrc || '',
        quality: quality.label || undefined,
        size: quality.size,
      }))
      .filter((link) => Boolean(link.url))
  }, [data])

  const downloadLinks = useMemo(() => {
    if (!data) return []

    return data.qualities
      .filter((quality) => Boolean(quality.downloadUrl || quality.videoSrc))
      .map((quality, idx) => ({
        label: `تحميل ${quality.label || `#${idx + 1}`}`,
        url: quality.downloadUrl || quality.videoSrc || '',
        quality: quality.label || undefined,
        size: quality.size,
      }))
      .filter((link) => Boolean(link.url))
  }, [data])

  const qualityTags = useMemo(() => {
    if (preGenres.length > 0) return preGenres.slice(0, 6)
    if (!data) return ['تحميل مباشر']

    const tags = Array.from(new Set(data.qualities.map((quality) => quality.label).filter(Boolean)))
    return tags.length > 0 ? tags.slice(0, 6) : ['تحميل مباشر']
  }, [data, preGenres])

  const resolvedDownloadUrl = useMemo(() => {
    if (downloadLinks[0]?.url) return downloadLinks[0].url
    return url
  }, [downloadLinks, url])

  const activeQuality = useMemo(() => {
    if (downloadLinks[0]) return downloadLinks[0]
    if (data?.qualities[0]) {
      return {
        label: data.qualities[0].label,
        size: data.qualities[0].size,
      }
    }

    return null
  }, [downloadLinks, data])

  const triggerDownload = useCallback(() => {
    if (!resolvedDownloadUrl) return

    const anchor = document.createElement('a')
    anchor.href = resolvedDownloadUrl
    anchor.target = '_self'
    anchor.rel = 'noreferrer'
    anchor.download = ''
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setDownloadStarted(true)
  }, [resolvedDownloadUrl])

  useEffect(() => {
    if (!done || !resolvedDownloadUrl || downloadStarted) return

    const timerId = window.setTimeout(() => {
      triggerDownload()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [done, resolvedDownloadUrl, downloadStarted, triggerDownload])

  const pageError = invalidUrl ? 'رابط التحميل غير صالح.' : loadErr
  const progress = ((COUNTDOWN - sec) / COUNTDOWN) * 100
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  const extraSection = (
    <section id="download-player" className="content-balanced-gutter mt-16 scroll-mt-28 px-3 py-14 font-[family-name:var(--font-cairo)] sm:px-6 lg:mt-20 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-[1660px]">
        <div className="mb-10 pt-3 text-right sm:mb-12 sm:pt-4 lg:pt-5">
          <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4" style={{ paddingTop: '34px', paddingBottom: '31px' }}>
            <span className="inline-flex min-h-[38px] items-center justify-center rounded-[13px] border-2 border-[#ffe88a] bg-[linear-gradient(180deg,#ffe98d_0%,#f6c90e_52%,#d6a10a_100%)] px-4 py-2 font-[family-name:var(--font-cairo)] text-[13px] font-black leading-none tracking-[0.01em] text-[#2b1f00] shadow-[0_10px_18px_rgba(246,201,14,0.36),0_0_0_1px_rgba(100,70,0,0.28),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-2px_0_rgba(126,88,0,0.32)] sm:min-h-[42px] sm:px-5 sm:text-[14px]">
              تلقائي
            </span>
            <h2 className="section-title-emphasis font-[family-name:var(--font-cairo)] text-[28px] font-black leading-none text-white [text-shadow:0_8px_22px_rgba(0,0,0,0.5)] sm:text-[36px]">
              بدء التحميل
            </h2>
            <span className="h-11 w-2 shrink-0 rounded-full bg-[linear-gradient(180deg,#ffe066_0%,#f6c90e_60%,#b8860b_100%)] shadow-[0_0_24px_rgba(246,201,14,0.56),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_0_rgba(0,0,0,0.22)] sm:h-14" />
          </div>
        </div>

        <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,17,30,0.92),rgba(10,10,18,0.72))] p-5 shadow-[0_22px_54px_rgba(0,0,0,0.35)] sm:p-6">
          <div className="flex w-full min-h-[360px] flex-col justify-center gap-6 rounded-[22px] border border-white/10 bg-[#121318]/90 p-6 text-center sm:min-h-[400px] lg:min-h-[430px]">
            {!done ? (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="relative h-36 w-36">
                  <svg width="144" height="144" viewBox="0 0 128 128" className="h-full w-full" style={{ transform: 'rotate(-90deg)' }}>
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
                    <span className="text-5xl font-black tabular-nums text-white">{sec}</span>
                  </div>
                </div>
                <p className="text-base text-white/72">سيبدأ التحميل تلقائيًا بعد انتهاء العداد</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#f6c90e]/35 bg-[#f6c90e]/10 p-5">
                  <p className="text-base font-bold text-[#ffe278]">
                    {downloadStarted ? 'تم بدء التحميل تلقائيًا' : 'التحميل جاهز الآن'}
                  </p>
                  <p className="mt-2 text-sm text-white/70">إذا لم يبدأ التحميل تلقائيًا اضغط الزر أدناه.</p>
                </div>

                <button
                  type="button"
                  onClick={triggerDownload}
                  disabled={!resolvedDownloadUrl}
                  className="w-full rounded-xl bg-gradient-to-r from-[#f6c90e] to-[#ffe88a] px-8 py-4 text-lg font-black text-[#0f0f14] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  إعادة بدء التحميل
                </button>

                {resolvedDownloadUrl ? (
                  <a
                    href={resolvedDownloadUrl}
                    className="inline-block rounded-lg border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-semibold text-white/80 hover:bg-white/[0.08]"
                  >
                    رابط التحميل المباشر
                  </a>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-right md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-[11px] text-white/55">الجودة</div>
                <div className="mt-1 text-sm font-bold text-[#ffe278]">{activeQuality?.label || '-'}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-[11px] text-white/55">الحجم</div>
                <div className="mt-1 text-sm font-bold text-white">{activeQuality?.size || '-'}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-[11px] text-white/55">الحالة</div>
                <div className={`mt-1 text-sm font-bold ${done ? 'text-emerald-300' : 'text-[#f6c90e]'}`}>{done ? 'جاهز' : 'قيد التجهيز'}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <div className="text-[11px] text-white/55">المتبقي</div>
                <div className="mt-1 text-sm font-black text-white tabular-nums">{done ? '0s' : `${sec}s`}</div>
              </div>
            </div>

            {pageError ? (
              <div className="rounded-xl border border-rose-400/35 bg-rose-500/10 p-3 text-sm text-rose-200">
                تعذر جلب بيانات الجودة بدقة، لكن رابط التحميل ما زال متاحًا.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <ContentDetailsPage
      title={data?.title || preTitle || 'التحميل المباشر'}
      poster={toProxyPoster(prePoster || data?.poster)}
      description={preDescription || 'صفحة تحميل متكاملة مع عداد قصير قبل بدء التنزيل التلقائي ومعلومات الجودة المتاحة.'}
      rating={preRating}
      year={preYear}
      genres={qualityTags}
      breadcrumbs={[
        { label: 'الرئيسية', href: '/' },
        { label: 'التحميل المباشر' },
      ]}
      watchLinks={watchLinks}
      downloadLinks={downloadLinks}
      recommendations={[]}
      recommendationsPath="/"
      typeLabel={preTypeLabel || 'تحميل'}
      hideHeroWatchButton
      hideActionLinksSection
      extraSection={extraSection}
    />
  )
}

function DownloadInner() {
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

  return (
    <DownloadExperience
      key={url || 'download-empty'}
      url={url}
      preTitle={preTitle}
      prePoster={prePoster}
      preDescription={preDescription}
      preTypeLabel={preTypeLabel}
      preGenres={preGenres}
      preRating={Number.isFinite(preRatingRaw) ? preRatingRaw : undefined}
      preYear={Number.isFinite(preYearRaw) ? preYearRaw : undefined}
    />
  )
}

export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f1015] flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f6c90e] border-t-transparent" />
        </div>
      }
    >
      <DownloadInner />
    </Suspense>
  )
}

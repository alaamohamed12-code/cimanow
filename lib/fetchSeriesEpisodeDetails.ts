import { Content } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const SERIES_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']*\/series\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
const EPISODE_LINK_RE = /<a[^>]+href=["']([^"']*(?:\/show\/episode\/|\/episode\/)[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
const ACTION_LINK_RE = /<a[^>]+href=["'](https?:\/\/go\.ak\.sv\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
const POSTER_RE = /https?:\/\/img\.downet\.net\/(?:thumb\/\d+x\d+\/)?uploads\/[^"'\s<>()]+/gi
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi
const STYLE_RE = /<style\b[^>]*>[\s\S]*?<\/style>/gi
const COMMENT_RE = /<!--[\s\S]*?-->/g
const TAG_RE = /<[^>]+>/g
const SPACE_RE = /\s+/g

interface ActionLink {
  label: string
  url: string
  quality?: string
  size?: string
}

export interface SeriesEpisodeItem {
  title: string
  episodeNumber: number
  date: string
  sourceUrl: string
  image: string
}

export interface SeriesDetailsPayload {
  title: string
  poster: string
  description: string
  rating: number
  year: number
  language: string
  quality: string
  duration: string
  country: string
  ageRating: string
  genres: string[]
  cast: string[]
  gallery: string[]
  episodes: SeriesEpisodeItem[]
  recommendations: Content[]
}

export interface EpisodeDetailsPayload {
  title: string
  poster: string
  description: string
  rating: number
  year: number
  language: string
  quality: string
  duration: string
  country: string
  episodeNumber: number
  seriesTitle: string
  seriesSourceUrl: string
  sourceUrl: string
  watchLinks: ActionLink[]
  downloadLinks: ActionLink[]
  recommendations: Content[]
}

const decodeHtml = (value: string): string => {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

const normalizeText = (value: string): string => {
  return decodeHtml(value).replace(TAG_RE, ' ').replace(SPACE_RE, ' ').trim()
}

const stripNoise = (html: string): string => {
  return html.replace(SCRIPT_RE, ' ').replace(STYLE_RE, ' ').replace(COMMENT_RE, ' ')
}

const toAbsoluteUrl = (value: string): string => {
  return value.startsWith('http') ? value : `https://ak.sv${value}`
}

const toProxyImageUrl = (value: string): string => {
  return `/api/image-proxy?url=${encodeURIComponent(value.replace(/\/thumb\/\d+x\d+\//i, '/'))}`
}

const fetchHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 120 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

const extractFirst = (text: string, pattern: RegExp, fallback = ''): string => {
  const match = text.match(pattern)
  return match?.[1]?.trim() || fallback
}

const between = (text: string, startPattern: RegExp, endPattern: RegExp): string => {
  const startMatch = text.match(startPattern)
  if (!startMatch || startMatch.index === undefined) {
    return ''
  }

  const fromStart = text.slice(startMatch.index + startMatch[0].length)
  const endMatch = fromStart.match(endPattern)
  if (!endMatch || endMatch.index === undefined) {
    return fromStart.trim()
  }

  return fromStart.slice(0, endMatch.index).trim()
}

const extractRating = (text: string): number => {
  const slashMatch = text.match(/10\s*\/\s*(\d(?:\.\d)?)/)
  if (slashMatch) return Number.parseFloat(slashMatch[1])
  const iconMatch = text.match(/\s*(\d(?:\.\d)?)/)
  if (iconMatch) return Number.parseFloat(iconMatch[1])
  return 0
}

const extractYear = (text: string): number => {
  const explicit = text.match(/السنة\s*:\s*(\d{4})/)
  if (explicit) return Number.parseInt(explicit[1], 10)
  const generic = text.match(/(19|20)\d{2}/)
  return generic ? Number.parseInt(generic[0], 10) : new Date().getFullYear()
}

const extractGenres = (html: string): string[] => {
  const genres = Array.from(html.matchAll(/<a[^>]+href=["'][^"']*series\?category=[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)).map((m) =>
    normalizeText(m[1])
  )

  return Array.from(new Set(genres.filter(Boolean))).slice(0, 8)
}

const normalizePersonName = (value: string): string => {
  const name = normalizeText(value)
  const parts = name.split(' ').filter(Boolean)

  if (parts.length >= 2 && parts.length % 2 === 0) {
    const half = parts.length / 2
    const left = parts.slice(0, half).join(' ')
    const right = parts.slice(half).join(' ')
    if (left === right) {
      return left
    }
  }

  return name
}

const extractCast = (html: string): string[] => {
  const names = Array.from(
    html.matchAll(/<a[^>]+href=["'][^"']*\/person\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/gi)
  ).map((match) => normalizePersonName(match[1]))

  return Array.from(new Set(names.filter(Boolean))).slice(0, 24)
}

const extractGallery = (html: string, mainPoster: string): string[] => {
  const posters = Array.from(new Set((html.match(POSTER_RE) || []).map((poster) => toProxyImageUrl(poster))))
  return posters.filter((poster) => poster !== mainPoster).slice(0, 12)
}

const findPosterForItem = (html: string, itemStart: number, itemEnd: number, nextItemStart?: number): string => {
  const beforeStart = Math.max(0, itemStart - 1200)
  const beforeChunk = html.slice(beforeStart, itemStart)
  const beforeMatches = Array.from(beforeChunk.matchAll(POSTER_RE)).map((match) => match[0])

  if (beforeMatches.length > 0) {
    return beforeMatches[beforeMatches.length - 1]
  }

  const afterEnd = nextItemStart ?? Math.min(html.length, itemEnd + 1500)
  const afterChunk = html.slice(itemEnd, afterEnd)
  const afterMatch = POSTER_RE.exec(afterChunk)
  POSTER_RE.lastIndex = 0
  return afterMatch?.[0] || ''
}

const extractSeriesRecommendations = (html: string, currentSeriesPath: string): Content[] => {
  const items: Content[] = []
  const currentId = currentSeriesPath.split('/')[2] || ''

  const matches: Array<{ url: string; title: string; start: number; end: number }> = []
  let linkMatch: RegExpExecArray | null

  while ((linkMatch = SERIES_LINK_RE.exec(html)) !== null) {
    const url = toAbsoluteUrl(linkMatch[1])
    const title = normalizeText(linkMatch[2])
    if (!url || !title) continue

    const id = new URL(url).pathname.split('/')[2] || ''
    if (!id || id === currentId) continue

    matches.push({
      url,
      title,
      start: linkMatch.index,
      end: linkMatch.index + linkMatch[0].length,
    })
  }

  const seen = new Set<string>()
  matches.forEach((entry, index) => {
    if (seen.has(entry.url) || items.length >= 12) return
    seen.add(entry.url)

    const next = matches[index + 1]
    const chunk = html.slice(entry.end, next ? next.start : Math.min(html.length, entry.end + 380))
    const clean = normalizeText(chunk)
    const poster = findPosterForItem(html, entry.start, entry.end, next?.start)

    const yearMatch = clean.match(/(19|20)\d{2}/)
    const ratingMatch = clean.match(/(\d(?:\.\d)?)/)

    items.push({
      id: `series-rec-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(poster) : '/images/poster-placeholder.svg',
      rating: ratingMatch ? Number.parseFloat(ratingMatch[1]) : 0,
      year: yearMatch ? Number.parseInt(yearMatch[0], 10) : new Date().getFullYear(),
      genre: 'مسلسل',
      description: `${entry.title} - مسلسل مقترح`,
      sourceUrl: entry.url,
    })
  })

  return items
}

const extractShowsRecommendations = (html: string, currentShowsPath: string): Content[] => {
  const items: Content[] = []
  const currentId = currentShowsPath.split('/')[2] || ''
  const matches = Array.from(
    html.matchAll(/<h3[^>]*>\s*<a[^>]+href=["']([^"']*\/shows\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi)
  )
    .map((match) => {
      const url = toAbsoluteUrl(match[1])
      const title = normalizeText(match[2])
      const id = new URL(url).pathname.split('/')[2] || ''

      return {
        url,
        title,
        id,
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
      }
    })
    .filter((entry) => entry.url && entry.title && entry.id && entry.id !== currentId)

  const seen = new Set<string>()
  matches.forEach((entry, index) => {
    if (seen.has(entry.url) || items.length >= 12) return
    seen.add(entry.url)

    const next = matches[index + 1]
    const chunk = html.slice(entry.end, next ? next.start : Math.min(html.length, entry.end + 380))
    const clean = normalizeText(chunk)
    const poster = findPosterForItem(html, entry.start, entry.end, next?.start)

    const yearMatch = clean.match(/(19|20)\d{2}/)
    const ratingMatch = clean.match(/(\d(?:\.\d)?)/)

    items.push({
      id: `shows-rec-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(poster) : '/images/poster-placeholder.svg',
      rating: ratingMatch ? Number.parseFloat(ratingMatch[1]) : 0,
      year: yearMatch ? Number.parseInt(yearMatch[0], 10) : new Date().getFullYear(),
      genre: 'برامج',
      description: `${entry.title} - برنامج مقترح`,
      sourceUrl: entry.url,
    })
  })

  return items
}

const extractEpisodes = (html: string): SeriesEpisodeItem[] => {
  const items: SeriesEpisodeItem[] = []
  const seen = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = EPISODE_LINK_RE.exec(html)) !== null) {
    const url = toAbsoluteUrl(match[1])
    const label = normalizeText(match[2])

    if (!url || !label || !url.includes('/episode/') || seen.has(url)) {
      continue
    }

    seen.add(url)

    const around = normalizeText(html.slice(Math.max(0, match.index - 220), match.index + 220))
    const date = extractFirst(around, /(ال\S+\s+\d{1,2}\s+\S+\s+\d{4}\s*-\s*[^\n]+)/i, '')
    const episodeNumRaw = extractFirst(label, /حلقة\s*(\d+)/i, '') || extractFirst(url, /الحلقة-(\d+)/i, '0')
    const poster = findPosterForItem(html, match.index, match.index + match[0].length)

    items.push({
      title: label,
      episodeNumber: Number.parseInt(episodeNumRaw, 10) || 0,
      date,
      sourceUrl: url,
      image: poster ? toProxyImageUrl(poster) : '/images/poster-placeholder.svg',
    })
  }

  // Keep source DOM order to match the original website ordering exactly.
  return items
}

const extractActionLinks = (html: string) => {
  const watchLinks: ActionLink[] = []
  const downloadLinks: ActionLink[] = []

  const watchSectionStart = html.indexOf('مشاهدة وتحميل')
  const watchSectionEnd = watchSectionStart >= 0 ? html.indexOf('شاهد المزيد', watchSectionStart) : -1
  const scopedHtml =
    watchSectionStart >= 0
      ? html.slice(watchSectionStart, watchSectionEnd > watchSectionStart ? watchSectionEnd : watchSectionStart + 12000)
      : html

  let match: RegExpExecArray | null
  while ((match = ACTION_LINK_RE.exec(scopedHtml)) !== null) {
    const url = match[1]
    const label = normalizeText(match[2])
    const around = normalizeText(scopedHtml.slice(Math.max(0, match.index - 140), match.index + 120))
    const quality = extractFirst(around, /(2160p|1080p|720p|480p)/i)
    const size = extractFirst(label, /(\d+(?:\.\d+)?\s*(?:gb|mb))/i)

    const entry: ActionLink = {
      label,
      url,
      quality: quality || undefined,
      size: size ? size.toUpperCase() : undefined,
    }

    if (label.includes('تحميل') || url.includes('/link/')) {
      downloadLinks.push(entry)
    } else if (label.includes('مشاهدة') || url.includes('/watch/')) {
      watchLinks.push(entry)
    }
  }

  return { watchLinks, downloadLinks }
}

const extractSeriesLinkFromEpisodePage = (html: string): { title: string; url: string } => {
  // Prefer /series/ links; fall back to /shows/ links (for TV show episodes)
  const seriesCandidates = Array.from(
    html.matchAll(/<a[^>]+href=["']([^"']*\/series\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
  )
  if (seriesCandidates.length > 0) {
    const picked = seriesCandidates[0]
    return { title: normalizeText(picked[2]) || 'المسلسل', url: toAbsoluteUrl(picked[1]) }
  }

  const showsCandidates = Array.from(
    html.matchAll(/<a[^>]+href=["']([^"']*\/shows\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
  )
  if (showsCandidates.length > 0) {
    const picked = showsCandidates[0]
    return { title: normalizeText(picked[2]) || 'البرنامج', url: toAbsoluteUrl(picked[1]) }
  }

  return { title: 'الرجوع', url: '' }
}

export const getSeriesDetails = async (pathOrUrl: string): Promise<SeriesDetailsPayload> => {
  const absoluteUrl = pathOrUrl.startsWith('http') ? pathOrUrl : toAbsoluteUrl(pathOrUrl)
  const parsed = new URL(absoluteUrl)

  if (!parsed.pathname.startsWith('/series/')) {
    throw new Error('Only series paths are supported')
  }

  const html = await fetchHtml(absoluteUrl)
  const safeHtml = stripNoise(html)
  const cleanText = normalizeText(safeHtml)

  const title =
    extractFirst(safeHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    extractFirst(safeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i, 'تفاصيل المسلسل')

  const rawPoster = (safeHtml.match(POSTER_RE) || [])[0] || ''
  const poster = rawPoster ? toProxyImageUrl(rawPoster) : '/images/poster-placeholder.svg'

  const descriptionBlock =
    between(cleanText, /مشاهدة\s*و\s*تحميل\s*مسلسل\s*/i, /فريق\s*العمل|الحلقات|المزيد|شاهد\s*المزيد|التعليقات|وسوم\s*:/i) ||
    between(cleanText, /قصة\s*المسلسل\s*/i, /فريق\s*العمل|الحلقات|المزيد|شاهد\s*المزيد|التعليقات|وسوم\s*:/i)

  const description = descriptionBlock.slice(0, 450) || 'لا يوجد وصف متاح حاليًا.'

  const language =
    extractFirst(cleanText, /اللغة\s*:\s*([\s\S]{1,40}?)(?=\s+الترجمة\s*:|\s+الجودة\s*:|\s+انتاج\s*:|\s+السنة\s*:|\s+مدة\s*المسلسل|$)/i, '') ||
    'غير محدد'
  const quality =
    extractFirst(cleanText, /الجودة\s*:\s*([\s\S]{1,60}?)(?=\s+انتاج\s*:|\s+السنة\s*:|\s+مدة\s*المسلسل|$)/i, '') ||
    'غير محدد'
  const duration =
    extractFirst(cleanText, /مدة\s*المسلسل\s*:\s*(\d+\s*(?:دقيقة|ساعة|ساعات))/i, '') ||
    extractFirst(cleanText, /مدة\s*المسلسل\s*:\s*([\s\S]{1,30}?)(?=\s+اللغة\s*:|\s+الجودة\s*:|\s+انتاج\s*:|\s+السنة\s*:|$)/i, 'غير محدد')
  const country =
    extractFirst(cleanText, /انتاج\s*:\s*([\s\S]{1,40}?)(?=\s+السنة\s*:|\s+مدة\s*المسلسل|\s+اللغة\s*:|\s+الجودة\s*:|$)/i, '') ||
    'غير محدد'

  const ageRating = extractFirst(cleanText, /(PG\d+|R|G|NC\-17)/i, 'غير محدد')
  const rating = extractRating(cleanText)
  const year = extractYear(cleanText)
  const genres = extractGenres(safeHtml)
  const cast = extractCast(safeHtml)
  const gallery = extractGallery(safeHtml, poster)
  const episodes = extractEpisodes(safeHtml)
  const recommendations = extractSeriesRecommendations(safeHtml, parsed.pathname)

  return {
    title,
    poster,
    description,
    rating,
    year,
    language,
    quality,
    duration,
    country,
    ageRating,
    genres,
    cast,
    gallery,
    episodes,
    recommendations,
  }
}

export const getEpisodeDetails = async (pathOrUrl: string): Promise<EpisodeDetailsPayload> => {
  const absoluteUrl = pathOrUrl.startsWith('http') ? pathOrUrl : toAbsoluteUrl(pathOrUrl)
  const parsed = new URL(absoluteUrl)

  if (!parsed.pathname.startsWith('/episode/') && !parsed.pathname.startsWith('/show/episode/')) {
    throw new Error('Only episode paths are supported')
  }

  const html = await fetchHtml(absoluteUrl)
  const safeHtml = stripNoise(html)
  const cleanText = normalizeText(safeHtml)

  const title =
    extractFirst(safeHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    extractFirst(safeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i, 'تفاصيل الحلقة')

  const rawPoster = (safeHtml.match(POSTER_RE) || [])[0] || ''
  const poster = rawPoster ? toProxyImageUrl(rawPoster) : '/images/poster-placeholder.svg'

  const description = (() => {
    try {
      return (
        between(cleanText, /مشاهدة\s*و\s*تحميل\s*(?:الحلقة|برنامج|مسلسل)?\s*/i, /مشاهدة\s*وتحميل|شاهد\s*المزيد|التعليقات|وسوم\s*:/i).slice(0, 450) ||
        between(cleanText, /قصة\s*(?:الحلقة|البرنامج|المسلسل)?\s*/i, /فريق\s*العمل|المزيد|شاهد\s*المزيد|التعليقات|وسوم\s*:/i).slice(0, 450) ||
        'لا يوجد وصف متاح حاليًا.'
      )
    } catch {
      return 'لا يوجد وصف متاح حاليًا.'
    }
  })()

  const language =
    extractFirst(cleanText, /اللغة\s*:\s*([\s\S]{1,40}?)(?=\s*[-–]\s*|\s+(?:الترجمة|الجودة|انتاج|السنة|مدة)[^:]*:|$)/i) ||
    'غير محدد'
  const quality =
    extractFirst(cleanText, /الجودة\s*:\s*([\s\S]{1,60}?)(?=\s*[-–]\s*|\s+(?:انتاج|السنة|مدة)[^:]*:|$)/i) ||
    'غير محدد'
  const duration =
    extractFirst(cleanText, /مدة[^:]*:\s*(\d+\s*(?:دقيقة|ساعة|ساعات))/i) ||
    'غير محدد'
  const country =
    extractFirst(cleanText, /انتاج\s*:\s*([\s\S]{1,40}?)(?=\s*[-–]\s*|\s+(?:السنة|مدة|اللغة|الجودة)[^:]*:|$)/i) ||
    'غير محدد'

  const rating = extractRating(cleanText)
  const year = extractYear(cleanText)

  const episodeNumber =
    Number.parseInt(extractFirst(title, /الحلقة\s*(\d+)/i, '0'), 10) ||
    Number.parseInt(extractFirst(parsed.pathname, /الحلقة-(\d+)/i, '0'), 10) ||
    0

  const series = extractSeriesLinkFromEpisodePage(safeHtml)

  let { watchLinks, downloadLinks } = extractActionLinks(safeHtml)

  // Broader fallback: if scoped extraction found nothing, try the whole page
  if (watchLinks.length === 0 && downloadLinks.length === 0) {
    ACTION_LINK_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = ACTION_LINK_RE.exec(safeHtml)) !== null) {
      const url = match[1]
      const label = normalizeText(match[2])
      const quality = extractFirst(normalizeText(safeHtml.slice(Math.max(0, match.index - 140), match.index + 120)), /(2160p|1080p|720p|480p)/i)
      const size = extractFirst(label, /(\d+(?:\.\d+)?\s*(?:gb|mb))/i)
      const entry = { label, url, quality: quality || undefined, size: size ? size.toUpperCase() : undefined }
      if (label.includes('تحميل') || url.includes('/link/')) downloadLinks.push(entry)
      else if (label.includes('مشاهدة') || url.includes('/watch/')) watchLinks.push(entry)
    }
    ACTION_LINK_RE.lastIndex = 0
  }

  let recommendationsPath = '/series/0'
  if (series.url) {
    try { recommendationsPath = new URL(series.url).pathname } catch { /* ignore */ }
  }
  const recommendations = recommendationsPath.startsWith('/shows/')
    ? extractShowsRecommendations(safeHtml, recommendationsPath)
    : extractSeriesRecommendations(safeHtml, recommendationsPath)

  return {
    title,
    poster,
    description,
    rating,
    year,
    language,
    quality,
    duration,
    country,
    episodeNumber,
    seriesTitle: series.title,
    seriesSourceUrl: series.url,
    sourceUrl: absoluteUrl,
    watchLinks,
    downloadLinks,
    recommendations,
  }
}

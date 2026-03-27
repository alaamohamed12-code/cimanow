import { Content } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const ITEM_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
const POSTER_RE = /https?:\/\/img\.downet\.net\/(?:thumb\/\d+x\d+\/)?uploads\/[^"'\s<>()]+/gi
const HEADING_WITH_CLASS_RE = /<(h[1-6]|div|span)[^>]*class=["'][^"']*(?:head|title|section|block-title)[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi
const HEADING_RE = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi
const TAG_RE = /<[^>]+>/g
const SPACE_RE = /\s+/g

const GENRE_TOKENS = [
  'اكشن',
  'إكشن',
  'اثارة',
  'إثارة',
  'رعب',
  'دراما',
  'كوميدي',
  'كوميديا',
  'جريمة',
  'وثائقي',
  'خيال علمي',
  'خيال',
  'رومانسي',
  'سيرة ذاتية',
  'عائلي',
  'انمي',
  'أنمي',
  'غموض',
  'فانتازيا',
  'Talk show',
  'مسابقات',
  'ديني',
  'رمضان',
]

type HomeSection = 'featured' | 'movies' | 'series' | 'shows'

export interface MainHomePayload {
  featured: Content[]
  movies: Content[]
  series: Content[]
  shows: Content[]
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

const toAbsoluteUrl = (value: string): string => {
  return value.startsWith('http') ? value : `https://ak.sv${value}`
}

const toProxyImageUrl = (value: string): string => {
  return `/api/image-proxy?url=${encodeURIComponent(value)}`
}

const toOriginalPosterUrl = (value: string): string => {
  return value.replace(/\/thumb\/\d+x\d+\//i, '/')
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

const extractRating = (text: string): number => {
  const match = text.match(/(\d(?:\.\d)?)/)
  return match ? Number.parseFloat(match[1]) : 0
}

const extractYear = (text: string): number => {
  const match = text.match(/(19|20)\d{2}/)
  return match ? Number.parseInt(match[0], 10) : new Date().getFullYear()
}

const extractGenres = (text: string): string => {
  const matches = GENRE_TOKENS.filter((token) => text.includes(token))
  return matches.length > 0 ? Array.from(new Set(matches)).join('، ') : 'غير محدد'
}

const findPosterForItem = (html: string, itemStart: number, itemEnd: number, nextItemStart?: number): string => {
  const beforeStart = Math.max(0, itemStart - 1400)
  const beforeChunk = html.slice(beforeStart, itemStart)
  const beforeMatches = Array.from(beforeChunk.matchAll(POSTER_RE)).map((match) => match[0])

  if (beforeMatches.length > 0) {
    return beforeMatches[beforeMatches.length - 1]
  }

  const afterEnd = nextItemStart ?? Math.min(html.length, itemEnd + 1800)
  const afterChunk = html.slice(itemEnd, afterEnd)
  const afterMatch = POSTER_RE.exec(afterChunk)
  POSTER_RE.lastIndex = 0
  return afterMatch?.[0] || ''
}

const detectSectionFromUrl = (url: string): HomeSection => {
  if (url.includes('/series/')) return 'series'
  if (url.includes('/shows/')) return 'shows'
  if (url.includes('/movie/')) return 'movies'

  return 'featured'
}

const detectSectionFromHeading = (headingText: string): HomeSection | null => {
  const text = headingText.toLowerCase()

  if (text.includes('مسلسلات') || text.includes('series')) return 'series'
  if (text.includes('تلفزيون') || text.includes('برامج') || text.includes('tv') || text.includes('shows')) return 'shows'
  if (text.includes('افلام') || text.includes('أفلام') || text.includes('movies')) return 'movies'
  if (text.includes('المميزة') || text.includes('مميزة') || text.includes('featured')) return 'featured'

  return null
}

const extractSectionMarkers = (html: string): Array<{ index: number; section: HomeSection }> => {
  const markers: Array<{ index: number; section: HomeSection }> = []

  let classMatch: RegExpExecArray | null
  while ((classMatch = HEADING_WITH_CLASS_RE.exec(html)) !== null) {
    const headingText = normalizeText(classMatch[2])
    const section = detectSectionFromHeading(headingText)

    if (section) {
      markers.push({ index: classMatch.index, section })
    }
  }

  let headingMatch: RegExpExecArray | null
  while ((headingMatch = HEADING_RE.exec(html)) !== null) {
    const rawHeading = headingMatch[1]
    if (rawHeading.includes('<a')) {
      continue
    }

    const headingText = normalizeText(rawHeading)
    const section = detectSectionFromHeading(headingText)

    if (section) {
      markers.push({ index: headingMatch.index, section })
    }
  }

  markers.sort((a, b) => a.index - b.index)

  const unique: Array<{ index: number; section: HomeSection }> = []
  for (const marker of markers) {
    const prev = unique[unique.length - 1]
    if (prev && prev.index === marker.index && prev.section === marker.section) {
      continue
    }
    unique.push(marker)
  }

  return unique
}

const pushUnique = (list: Content[], seen: Set<string>, item: Content) => {
  const key = `${item.title.toLowerCase()}::${item.year}`
  if (seen.has(key)) return
  seen.add(key)
  list.push(item)
}

export const getMainHomeContent = async (): Promise<MainHomePayload> => {
  const html = await fetchHtml('https://ak.sv/main')
  const sectionMarkers = extractSectionMarkers(html)

  const featured: Content[] = []
  const movies: Content[] = []
  const series: Content[] = []
  const shows: Content[] = []

  const seenFeatured = new Set<string>()
  const seenMovies = new Set<string>()
  const seenSeries = new Set<string>()
  const seenShows = new Set<string>()

  const matches: Array<{ url: string; title: string; start: number; end: number }> = []
  let match: RegExpExecArray | null

  while ((match = ITEM_LINK_RE.exec(html)) !== null) {
    const rawUrl = match[1]
    const rawTitle = normalizeText(match[2])

    if (!rawUrl || !rawTitle) {
      continue
    }

    matches.push({
      url: toAbsoluteUrl(rawUrl),
      title: rawTitle,
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  let markerPointer = -1

  matches.forEach((entry, index) => {
    const next = matches[index + 1]
    const metadataChunk = html.slice(entry.end, next ? next.start : Math.min(html.length, entry.end + 420))
    const cleanChunk = normalizeText(metadataChunk)

    while (markerPointer + 1 < sectionMarkers.length && sectionMarkers[markerPointer + 1].index <= entry.start) {
      markerPointer += 1
    }

    const year = extractYear(cleanChunk)
    const rating = extractRating(cleanChunk)
    const genre = extractGenres(cleanChunk)
    const poster = findPosterForItem(html, entry.start, entry.end, next?.start)

    const item: Content = {
      id: `main-live-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(toOriginalPosterUrl(poster)) : '/images/poster-placeholder.svg',
      rating,
      year,
      genre,
      description: `${entry.title} - ${cleanChunk.slice(0, 100)}`,
      sourceUrl: entry.url,
    }

    const section = markerPointer >= 0 ? sectionMarkers[markerPointer].section : detectSectionFromUrl(entry.url)

    if (section === 'movies') {
      pushUnique(movies, seenMovies, item)
      return
    }

    if (section === 'series') {
      pushUnique(series, seenSeries, item)
      return
    }

    if (section === 'shows') {
      pushUnique(shows, seenShows, item)
      return
    }

    pushUnique(featured, seenFeatured, item)
  })

  const featuredFallback = [...movies, ...series, ...shows].slice(0, 10)

  return {
    featured: featured.length > 0 ? featured.slice(0, 20) : featuredFallback,
    movies: movies.slice(0, 20),
    series: series.slice(0, 20),
    shows: shows.slice(0, 20),
  }
}

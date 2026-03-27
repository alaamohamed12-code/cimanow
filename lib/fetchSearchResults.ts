import { Content } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const ITEM_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
const POSTER_RE = /https?:\/\/img\.downet\.net\/(?:thumb\/\d+x\d+\/)?uploads\/[^"'\s<>()]+/gi
const PAGE_RE = /(?:https?:\/\/ak\.sv)?\/search\?q=[^"'\s>]*&page=(\d+)/gi
const TAG_RE = /<[^>]+>/g
const SPACE_RE = /\s+/g

export interface SearchResultsPayload {
  items: Content[]
  page: number
  totalPages: number
}

const GENRE_TOKENS = [
  'رمضان',
  'كوميدي',
  'دراما',
  'إثارة',
  'اثارة',
  'رعب',
  'جريمة',
  'خيال',
  'وثائقي',
  'كاميرا خفية',
  'فني',
  'مصارعة',
  'اغنية',
  'أغنية',
  'البوم',
  'ألبوم',
  'مباراة',
  'كتاب',
  'رواية',
  'اذاعي',
  'إذاعي',
]

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

const extractRating = (text: string): number => {
  const slashMatch = text.match(/10\s*\/\s*(\d(?:\.\d)?)/)
  if (slashMatch) return Number.parseFloat(slashMatch[1])
  const match = text.match(/(\d(?:\.\d)?)/)
  return match ? Number.parseFloat(match[1]) : 0
}

const extractYear = (text: string): number => {
  const match = text.match(/(19|20)\d{2}/)
  return match ? Number.parseInt(match[0], 10) : new Date().getFullYear()
}

const detectGenre = (title: string, text: string, url: string): string => {
  if (url.includes('/movie/')) return 'فيلم'
  if (url.includes('/series/')) return 'مسلسل'
  if (url.includes('/shows/')) return 'تلفزيون'
  if (url.includes('/mix/')) return 'منوعات'

  const merged = `${title} ${text}`
  const matches = GENRE_TOKENS.filter((token) => merged.includes(token))
  return matches[0] || 'غير محدد'
}

const findPosterForItem = (html: string, itemStart: number, itemEnd: number, nextItemStart?: number): string => {
  const beforeStart = Math.max(0, itemStart - 1200)
  const beforeChunk = html.slice(beforeStart, itemStart)
  const beforeMatches = Array.from(beforeChunk.matchAll(POSTER_RE)).map((match) => match[0])

  if (beforeMatches.length > 0) {
    return beforeMatches[beforeMatches.length - 1]
  }

  const afterEnd = nextItemStart ?? Math.min(html.length, itemEnd + 1600)
  const afterChunk = html.slice(itemEnd, afterEnd)
  const afterMatch = POSTER_RE.exec(afterChunk)
  POSTER_RE.lastIndex = 0
  return afterMatch?.[0] || ''
}

export const getSearchResults = async (query: string, page: number): Promise<SearchResultsPayload> => {
  const trimmed = query.trim()
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  if (!trimmed) {
    return { items: [], page: 1, totalPages: 1 }
  }

  const html = await fetchHtml(`https://ak.sv/search?q=${encodeURIComponent(trimmed)}&page=${safePage}`)
  const matches: Array<{ url: string; title: string; start: number; end: number }> = []
  let match: RegExpExecArray | null

  while ((match = ITEM_LINK_RE.exec(html)) !== null) {
    const url = toAbsoluteUrl(match[1])
    const title = normalizeText(match[2])
    if (!url || !title) continue

    const supported = ['/movie/', '/series/', '/shows/', '/mix/']
    if (!supported.some((prefix) => new URL(url).pathname.startsWith(prefix))) continue

    matches.push({
      url,
      title,
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  const items = matches.map((entry, index) => {
    const next = matches[index + 1]
    const chunk = html.slice(entry.end, next ? next.start : Math.min(html.length, entry.end + 420))
    const cleanChunk = normalizeText(chunk)
    const poster = findPosterForItem(html, entry.start, entry.end, next?.start)

    return {
      id: `search-live-${safePage}-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(poster) : '/images/poster-placeholder.svg',
      rating: extractRating(cleanChunk),
      year: extractYear(cleanChunk),
      genre: detectGenre(entry.title, cleanChunk, entry.url),
      description: `${entry.title} - ${cleanChunk.slice(0, 120)}`,
      sourceUrl: entry.url,
    } as Content
  })

  const pages = new Set<number>([safePage])
  let pageMatch: RegExpExecArray | null
  while ((pageMatch = PAGE_RE.exec(html)) !== null) {
    pages.add(Number.parseInt(pageMatch[1], 10))
  }

  return {
    items,
    page: safePage,
    totalPages: Math.max(...Array.from(pages), 1),
  }
}
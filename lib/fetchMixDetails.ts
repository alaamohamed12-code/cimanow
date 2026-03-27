import { Content } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const MIX_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']*\/mix\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
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

export interface MixDetailsPayload {
  title: string
  poster: string
  description: string
  rating: number
  year: number
  quality: string
  genres: string[]
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
  if (!startMatch || startMatch.index === undefined) return ''

  const fromStart = text.slice(startMatch.index + startMatch[0].length)
  const endMatch = fromStart.match(endPattern)
  if (!endMatch || endMatch.index === undefined) return fromStart.trim()

  return fromStart.slice(0, endMatch.index).trim()
}

const extractRating = (text: string): number => {
  const match = text.match(/10\s*\/\s*(\d(?:\.\d)?)/)
  return match ? Number.parseFloat(match[1]) : 0
}

const extractYear = (text: string): number => {
  const explicit = text.match(/السنة\s*:\s*(\d{4})/)
  if (explicit) return Number.parseInt(explicit[1], 10)
  const generic = text.match(/(19|20)\d{2}/)
  return generic ? Number.parseInt(generic[0], 10) : new Date().getFullYear()
}

const extractGenres = (html: string): string[] => {
  const genres = Array.from(html.matchAll(/<a[^>]+href=["'][^"']*mix\?category=[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi)).map((m) => normalizeText(m[1]))
  return Array.from(new Set(genres.filter(Boolean))).slice(0, 8)
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

const extractActionLinks = (html: string) => {
  const watchLinks: ActionLink[] = []
  const downloadLinks: ActionLink[] = []

  let match: RegExpExecArray | null
  while ((match = ACTION_LINK_RE.exec(html)) !== null) {
    const url = match[1]
    const label = normalizeText(match[2])
    const around = normalizeText(html.slice(Math.max(0, match.index - 140), match.index + 120))
    const quality = extractFirst(around, /(FLAC|MP3|WEB-DL|1080p|720p|480p)/i)
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

const extractRecommendations = (html: string, currentPath: string): Content[] => {
  const currentId = currentPath.split('/')[2] || ''
  const items: Content[] = []
  const matches: Array<{ url: string; title: string; start: number; end: number }> = []
  let linkMatch: RegExpExecArray | null

  while ((linkMatch = MIX_LINK_RE.exec(html)) !== null) {
    const url = toAbsoluteUrl(linkMatch[1])
    const title = normalizeText(linkMatch[2])
    const id = new URL(url).pathname.split('/')[2] || ''
    if (!url || !title || !id || id === currentId) continue

    matches.push({ url, title, start: linkMatch.index, end: linkMatch.index + linkMatch[0].length })
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
      id: `mix-rec-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(poster) : '/images/poster-placeholder.svg',
      rating: ratingMatch ? Number.parseFloat(ratingMatch[1]) : 0,
      year: yearMatch ? Number.parseInt(yearMatch[0], 10) : new Date().getFullYear(),
      genre: 'منوعات',
      description: `${entry.title} - عنصر منوعات مقترح`,
      sourceUrl: entry.url,
    })
  })

  return items
}

export const getMixDetails = async (pathOrUrl: string): Promise<MixDetailsPayload> => {
  const absoluteUrl = pathOrUrl.startsWith('http') ? pathOrUrl : toAbsoluteUrl(pathOrUrl)
  const parsed = new URL(absoluteUrl)

  if (!parsed.pathname.startsWith('/mix/')) {
    throw new Error('Only mix paths are supported')
  }

  const html = await fetchHtml(absoluteUrl)
  const safeHtml = stripNoise(html)
  const cleanText = normalizeText(safeHtml)

  const title =
    extractFirst(safeHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    extractFirst(safeHtml, /<title[^>]*>([\s\S]*?)<\/title>/i, 'تفاصيل المنوعات')

  const rawPoster = (safeHtml.match(POSTER_RE) || [])[0] || ''
  const poster = rawPoster ? toProxyImageUrl(rawPoster) : '/images/poster-placeholder.svg'

  const description =
    between(cleanText, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), /روابط\s*التحميل|مشاهدة\s*وتحميل|المزيد|التعليقات|وسوم\s*:/i).slice(0, 700) ||
    'لا يوجد وصف متاح حاليًا.'

  const quality = extractFirst(cleanText, /(FLAC|MP3|WEB-DL|1080p|720p|480p)/i, 'غير محدد')
  const rating = extractRating(cleanText)
  const year = extractYear(cleanText)
  const genres = extractGenres(safeHtml)
  const { watchLinks, downloadLinks } = extractActionLinks(safeHtml)
  const recommendations = extractRecommendations(safeHtml, parsed.pathname)

  return {
    title,
    poster,
    description,
    rating,
    year,
    quality,
    genres,
    watchLinks,
    downloadLinks,
    recommendations,
  }
}
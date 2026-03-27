import { Content } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const MOVIE_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']*\/movie\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
const POSTER_RE = /https?:\/\/img\.downet\.net\/(?:thumb\/\d+x\d+\/)?uploads\/[^"'\s<>()]+/gi
const PAGE_RE = /(?:https?:\/\/ak\.sv)?\/movies\?[^"'\s>]*page=(\d+)/gi
const SELECT_RE = /<select[^>]*name=["']?([^"'\s>]+)[^>]*>([\s\S]*?)<\/select>/gi
const OPTION_RE = /<option[^>]*value=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/option>/gi
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
]

export interface MoviesListingResponse {
  items: Content[]
  page: number
  totalPages: number
  filterFields: Array<{
    name: string
    label: string
    options: Array<{ value: string; label: string }>
  }>
}

export type SourceFilters = Record<string, string>

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

const getFieldLabel = (name: string): string => {
  const key = name.toLowerCase()
  const map: Record<string, string> = {
    section: 'القسم',
    category: 'التصنيف',
    genre: 'التصنيف',
    rate: 'التقييم',
    rating: 'التقييم',
    year: 'سنة الإنتاج',
    production: 'سنة الإنتاج',
    language: 'اللغة',
    lang: 'اللغة',
    quality: 'الجودة',
    resolution: 'الدقة',
  }

  return map[key] || name
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

const extractDescription = (title: string, metadata: string): string => {
  const compact = metadata.replace(SPACE_RE, ' ').trim()
  if (!compact) {
    return `${title} - فيلم من قائمة الأفلام الرئيسية`
  }

  return `${title} - ${compact.slice(0, 100)}`
}

const fetchHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 1800 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

const applySearch = (items: Content[], search?: string): Content[] => {
  if (!search || !search.trim()) {
    return items
  }

  const query = search.toLowerCase()

  return items.filter((item) => {
    return item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  })
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

const extractFilterFields = (html: string) => {
  const fields: MoviesListingResponse['filterFields'] = []
  let selectMatch: RegExpExecArray | null

  while ((selectMatch = SELECT_RE.exec(html)) !== null) {
    const name = (selectMatch[1] || '').trim()
    const optionsHtml = selectMatch[2] || ''

    if (!name) {
      continue
    }

    const options: Array<{ value: string; label: string }> = []
    let optionMatch: RegExpExecArray | null

    while ((optionMatch = OPTION_RE.exec(optionsHtml)) !== null) {
      const value = (optionMatch[1] || '').trim()
      const label = normalizeText(optionMatch[2] || '')

      if (!label) {
        continue
      }

      options.push({ value, label })
    }

    if (options.length > 0) {
      fields.push({
        name,
        label: getFieldLabel(name),
        options,
      })
    }
  }

  return fields
}

export const getMoviesListing = async (
  page: number,
  sourceFilters: SourceFilters = {},
  search?: string
): Promise<MoviesListingResponse> => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(sourceFilters)) {
    if (value && value !== 'all') {
      params.set(key, value)
    }
  }
  params.set('page', String(safePage))

  const html = await fetchHtml(`https://ak.sv/movies?${params.toString()}`)

  const titleMatches: Array<{ url: string; title: string; start: number; end: number }> = []
  let linkMatch: RegExpExecArray | null

  while ((linkMatch = MOVIE_LINK_RE.exec(html)) !== null) {
    const relativeUrl = linkMatch[1]
    const title = normalizeText(linkMatch[2])

    if (!title || !relativeUrl) {
      continue
    }

    titleMatches.push({
      url: toAbsoluteUrl(relativeUrl),
      title,
      start: linkMatch.index,
      end: linkMatch.index + linkMatch[0].length,
    })
  }

  const items = titleMatches.map((entry, index) => {
    const next = titleMatches[index + 1]
    const chunk = html.slice(entry.end, next ? next.start : Math.min(html.length, entry.end + 420))
    const cleanChunk = normalizeText(chunk)

    const year = extractYear(cleanChunk)
    const rating = extractRating(cleanChunk)
    const genre = extractGenres(cleanChunk)
    const description = extractDescription(entry.title, cleanChunk)
    const poster = findPosterForItem(html, entry.start, entry.end, next?.start)

    return {
      id: `movie-live-${safePage}-${index + 1}`,
      title: entry.title,
      image: poster ? toProxyImageUrl(toOriginalPosterUrl(poster)) : '/images/poster-placeholder.svg',
      rating,
      year,
      genre,
      description,
      sourceUrl: entry.url,
    } as Content
  })

  const filteredItems = applySearch(items, search)

  const pages = new Set<number>()
  let pageMatch: RegExpExecArray | null
  while ((pageMatch = PAGE_RE.exec(html)) !== null) {
    pages.add(Number.parseInt(pageMatch[1], 10))
  }

  const maxPage = pages.size > 0 ? Math.max(...Array.from(pages)) : safePage

  return {
    items: filteredItems,
    page: safePage,
    totalPages: Math.max(1, maxPage),
    filterFields: extractFilterFields(html),
  }
}
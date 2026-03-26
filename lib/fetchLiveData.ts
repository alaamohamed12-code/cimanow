import { Content, mockFeatured, mockMiscellaneous, mockMovies, mockSeries } from '@/lib/mockData'

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const DETAIL_LINK_RE = /<h3[^>]*>\s*<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>/gi
const POSTER_RE = /https?:\/\/img\.downet\.net\/(?:thumb\/\d+x\d+\/)?uploads\/[^"'\s<>()]+/i
const TAG_RE = /<[^>]+>/g
const SPACE_RE = /\s+/g

type SectionName = 'featured' | 'movies' | 'series' | 'shows'

const sectionSources: Record<SectionName, { url: string; fallback: Content[] }> = {
  featured: {
    url: 'https://ak.sv/main',
    fallback: mockFeatured,
  },
  movies: {
    url: 'https://ak.sv/movies',
    fallback: mockMovies,
  },
  series: {
    url: 'https://ak.sv/series',
    fallback: mockSeries,
  },
  shows: {
    url: 'https://ak.sv/shows',
    fallback: mockMiscellaneous,
  },
}

const titleMapCache = new Map<string, Promise<Map<string, string>>>()
const posterCache = new Map<string, Promise<string | null>>()

const normalizeText = (value: string): string => {
  return decodeHtml(value).replace(TAG_RE, ' ').replace(SPACE_RE, ' ').trim().toLowerCase()
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

const toAbsoluteUrl = (value: string): string => {
  return value.startsWith('http') ? value : `https://ak.sv${value}`
}

const toProxyImageUrl = (value: string): string => {
  return `/api/image-proxy?url=${encodeURIComponent(value)}`
}

const fetchHtml = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

const buildTitleMap = async (url: string): Promise<Map<string, string>> => {
  const cached = titleMapCache.get(url)

  if (cached) {
    return cached
  }

  const task = (async () => {
    const html = await fetchHtml(url)
    const titleMap = new Map<string, string>()

    for (const match of html.matchAll(DETAIL_LINK_RE)) {
      const rawUrl = match[1]
      const rawTitle = match[2]

      if (!rawTitle || !rawUrl) {
        continue
      }

      const title = normalizeText(rawTitle)
      if (!title || titleMap.has(title)) {
        continue
      }

      titleMap.set(title, toAbsoluteUrl(rawUrl))
    }

    return titleMap
  })()

  titleMapCache.set(url, task)
  return task
}

const extractPoster = async (detailUrl: string): Promise<string | null> => {
  const cached = posterCache.get(detailUrl)

  if (cached) {
    return cached
  }

  const task = (async () => {
    try {
      const html = await fetchHtml(detailUrl)
      const posterMatch = html.match(POSTER_RE)
      return posterMatch ? posterMatch[0] : null
    } catch (error) {
      console.error(`Failed to extract poster from ${detailUrl}:`, error)
      return null
    }
  })()

  posterCache.set(detailUrl, task)
  return task
}

const enrichWithLiveImages = async (section: SectionName): Promise<Content[]> => {
  const { url, fallback } = sectionSources[section]

  try {
    const titleMap = await buildTitleMap(url)

    const enriched = await Promise.all(
      fallback.map(async (item) => {
        const detailUrl = titleMap.get(normalizeText(item.title))

        if (!detailUrl) {
          return item
        }

        const posterUrl = await extractPoster(detailUrl)

        if (!posterUrl) {
          return item
        }

        return {
          ...item,
          image: toProxyImageUrl(posterUrl),
        }
      })
    )

    return enriched
  } catch (error) {
    console.error(`Failed to enrich ${section} with live images:`, error)
    return fallback
  }
}

export const getFeaturedContent = async (): Promise<Content[]> => {
  return enrichWithLiveImages('featured')
}

export const getMoviesContent = async (): Promise<Content[]> => {
  return enrichWithLiveImages('movies')
}

export const getSeriesContent = async (): Promise<Content[]> => {
  return enrichWithLiveImages('series')
}

export const getShowsContent = async (): Promise<Content[]> => {
  return enrichWithLiveImages('shows')
}

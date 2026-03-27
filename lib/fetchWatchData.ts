const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

const ALLOWED_MEDIA_HOSTS = new Set(['ak.sv', 'www.ak.sv', 'go.ak.sv', 'www.go.ak.sv'])

export interface VideoSource {
  src: string
  size: string
  type: string
}

export interface QualityOption {
  label: string
  tabId: string
  watchUrl: string
  downloadUrl: string
  size?: string
  videoSrc?: string
}

export interface WatchData {
  title: string
  poster: string
  watchPageUrl: string
  qualities: QualityOption[]
  videoSources: VideoSource[]
}

function normalizeMediaUrl(value: string): string {
  const raw = value.trim().replace(/&amp;/g, '&')
  if (raw.startsWith('//')) return `https:${raw}`
  return raw
    .replace(/^http:\/\/(?:www\.)?go\.ak\.sv/i, 'https://go.ak.sv')
    .replace(/^http:\/\/(?:www\.)?ak\.sv/i, 'https://ak.sv')
}

function assertAllowedMediaUrl(value: string): string {
  const normalized = normalizeMediaUrl(value)
  const parsed = new URL(normalized)

  if (!ALLOWED_MEDIA_HOSTS.has(parsed.hostname)) {
    throw new Error(`Host not allowed: ${parsed.hostname}`)
  }

  return parsed.toString()
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(assertAllowedMediaUrl(url), {
    headers: REQUEST_HEADERS,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

async function resolveGoUrl(goUrl: string): Promise<string> {
  const html = await fetchHtml(goUrl)
  const directMatch = html.match(/href="(https?:\/\/ak\.sv\/(?:watch|download)\/[^"]+)"/i)
  if (directMatch) return assertAllowedMediaUrl(directMatch[1])

  const altMatch = html.match(/href="(https?:\/\/[a-z0-9.-]+\/(?:watch|download)\/\d+\/\d+\/[^"]+)"/i)
  if (altMatch) {
    return assertAllowedMediaUrl(altMatch[1].replace(/^https?:\/\/[^/]+/i, 'https://ak.sv'))
  }

  throw new Error(`Could not resolve watch URL from: ${goUrl}`)
}

function extractQualityLabels(html: string): Map<string, string> {
  const labels = new Map<string, string>()
  const re = /href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  while ((match = re.exec(html)) !== null) {
    const label = match[2].replace(/<[^>]+>/g, '').trim()
    if (label) labels.set(match[1], label)
  }

  return labels
}

function extractQualityOptions(html: string, labels: Map<string, string>): QualityOption[] {
  const options: QualityOption[] = []
  const tabRe = /<div\s+class="tab-content quality"[^>]+id="tab-(\d+)"[^>]*>([\s\S]*?)(?=<div\s+class="tab-content|<\/div>\s*<\/div>\s*<\/div>\s*<div\s+class="text-left)/gi
  let match: RegExpExecArray | null

  while ((match = tabRe.exec(html)) !== null) {
    const tabId = match[1]
    const tabContent = match[2]
    const label = labels.get(tabId) ?? `${tabId}p`

    const watchMatch = tabContent.match(/class="[^"]*link-show[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-show[^"]*"/i)
    const watchUrl = normalizeMediaUrl(
      watchMatch?.[1] ??
      watchMatch?.[2] ??
      (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/watch\/[^"]+)"/i) || [])[1] ??
      ''
    )

    const downloadMatch = tabContent.match(/class="[^"]*link-download[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-download[^"]*"/i)
    const downloadUrl = normalizeMediaUrl(
      downloadMatch?.[1] ??
      downloadMatch?.[2] ??
      (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/link\/[^"]+)"/i) || [])[1] ??
      ''
    )

    const sizeMatch = tabContent.match(/class="font-size-14[^"]*">([^<]+(?:MB|GB))/i)
    const size = sizeMatch ? sizeMatch[1].trim() : undefined

    if (watchUrl || downloadUrl) {
      options.push({ label, tabId, watchUrl, downloadUrl, size })
    }
  }

  return options
}

function extractVideoSources(html: string): VideoSource[] {
  const sources: VideoSource[] = []
  const seen = new Set<string>()

  const pushSource = (src: string, type: string, size = '') => {
    if (!src) return

    const normalized = src
      .replace(/&amp;/g, '&')
      .replace(/^\/\//, 'https://')
      .trim()

    if (!/^https?:\/\//i.test(normalized) || seen.has(normalized)) {
      return
    }

    seen.add(normalized)
    sources.push({ src: normalized, type, size })
  }

  const btnLoaderRe = /<div[^>]*class="[^"]*btn-loader[^"]*"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*download[^>]*>/gi
  let match: RegExpExecArray | null
  while ((match = btnLoaderRe.exec(html)) !== null) {
    pushSource(match[1], 'video/mp4')
  }

  const downloadAnchorRe = /<a[^>]+href="([^"]+)"[^>]*download[^>]*>/gi
  while ((match = downloadAnchorRe.exec(html)) !== null) {
    const href = match[1]
    if (/\.(mp4|mkv|avi|webm)(\?|$)/i.test(href) || href.includes('/download/')) {
      pushSource(href, 'video/mp4')
    }
  }

  const sourceRe = /<source[^>]+>/gi
  while ((match = sourceRe.exec(html)) !== null) {
    const tag = match[0]
    const srcMatch = tag.match(/src="([^"]+)"/i)
    const typeMatch = tag.match(/type="(video\/[^"]+)"/i)
    const sizeMatch = tag.match(/size="(\d+)"/i)
    if (srcMatch && typeMatch) {
      pushSource(srcMatch[1], typeMatch[1], sizeMatch?.[1] ?? '')
    }
  }

  const mp4Re = /https?:\/\/[^\s"'<>]+\.mp4/gi
  while ((match = mp4Re.exec(html)) !== null) {
    pushSource(match[0], 'video/mp4')
  }

  return sources
}

async function scrapeWatchPage(watchUrl: string): Promise<Omit<WatchData, 'watchPageUrl'>> {
  const url = watchUrl.startsWith('http') ? assertAllowedMediaUrl(watchUrl) : `https://ak.sv${watchUrl}`
  const html = await fetchHtml(url)

  const titleMatch =
    html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ??
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)

  const title = titleMatch
    ? titleMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/^\s*(?:مشاهدة|watch)\s+/iu, '')
        .trim()
    : ''

  const posterPatterns = [
    /https?:\/\/img\.downet\.net\/(?!thumb)[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
    /https?:\/\/img\.akwam\.net\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
    /https?:\/\/img\.downet\.net\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
  ]

  let poster = ''
  for (const pattern of posterPatterns) {
    const match = html.match(pattern)
    if (match) {
      poster = match[0].split(/["'\s<>]/)[0]
      break
    }
  }

  const labels = extractQualityLabels(html)
  const qualities = extractQualityOptions(html, labels)
  const videoSources = extractVideoSources(html)

  for (const quality of qualities) {
    const numLabel = quality.label.replace(/[^0-9]/g, '')
    const match = videoSources.find((source) => source.size === numLabel || source.size === quality.tabId)
    if (match) {
      quality.videoSrc = match.src
    }
  }

  if (qualities.length === 0 && videoSources.length > 0) {
    for (const source of videoSources) {
      qualities.push({
        label: source.size ? `${source.size}p` : 'AUTO',
        tabId: source.size,
        watchUrl: '',
        downloadUrl: '',
        videoSrc: source.src,
      })
    }
  }

  return { title, poster, qualities, videoSources }
}

export async function fetchWatchData(goWatchUrl: string): Promise<WatchData> {
  const normalizedInput = assertAllowedMediaUrl(goWatchUrl)
  const isAksvMediaPage = /^https?:\/\/(?:www\.)?ak\.sv\/(?:watch|download)\//.test(normalizedInput)
  const watchPageUrl = isAksvMediaPage ? normalizedInput : await resolveGoUrl(normalizedInput)
  const data = await scrapeWatchPage(watchPageUrl)
  return { ...data, watchPageUrl }
}

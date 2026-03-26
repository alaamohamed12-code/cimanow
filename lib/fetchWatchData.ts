const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

export interface VideoSource {
  src: string
  size: string // e.g. "720"
  type: string // e.g. "video/mp4"
}

export interface QualityOption {
  label: string // e.g. "720p"
  tabId: string
  watchUrl: string
  downloadUrl: string
  size?: string // e.g. "934.0 MB"
  videoSrc?: string // direct MP4 URL if available
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

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(normalizeMediaUrl(url), {
    headers: REQUEST_HEADERS,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

/**
 * Resolve go.ak.sv/watch|link/{id} → ak.sv/watch|download/{id}/{episode}/{slug}
 */
async function resolveGoUrl(goUrl: string): Promise<string> {
  const html = await fetchHtml(goUrl)
  // The go.ak.sv page has href="https://ak.sv/watch/..." or "/download/..." links
  const m = html.match(/href="(https?:\/\/ak\.sv\/(?:watch|download)\/[^"]+)"/)
  if (m) return normalizeMediaUrl(m[1])
  // Fallback: try alternate mirror domains and normalize to ak.sv
  const altM = html.match(/href="(https?:\/\/[a-z0-9.-]+\/(?:watch|download)\/\d+\/\d+\/[^"]+)"/)
  if (altM) return normalizeMediaUrl(altM[1].replace(/^https?:\/\/[^/]+/, 'https://ak.sv'))
  throw new Error(`Could not resolve watch URL from: ${goUrl}`)
}

/**
 * Extract quality tab labels: Map<tabId, label> e.g. Map { "4" => "720p" }
 */
function extractQualityLabels(html: string): Map<string, string> {
  const labels = new Map<string, string>()
  const re = /href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const label = m[2].replace(/<[^>]+>/g, '').trim()
    if (label) labels.set(m[1], label)
  }
  return labels
}

/**
 * Extract quality options from <div class="tab-content quality" id="tab-N">
 * (excludes the commented-out duplicate sections)
 */
function extractQualityOptions(html: string, labels: Map<string, string>): QualityOption[] {
  const options: QualityOption[] = []

  // Match the real (non-commented) tab-content blocks that have class "quality"
  const tabRe = /<div\s+class="tab-content quality"[^>]+id="tab-(\d+)"[^>]*>([\s\S]*?)(?=<div\s+class="tab-content|<\/div>\s*<\/div>\s*<\/div>\s*<div\s+class="text-left)/gi
  let tabM: RegExpExecArray | null
  while ((tabM = tabRe.exec(html)) !== null) {
    const tabId = tabM[1]
    const tabContent = tabM[2]
    const label = labels.get(tabId) ?? `${tabId}p`

    // Watch link: class contains "link-show"
    const watchM = tabContent.match(/class="[^"]*link-show[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-show[^"]*"/)
    const watchUrl = normalizeMediaUrl(
      watchM?.[1] ??
      watchM?.[2] ??
      (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/watch\/[^"]+)"/) || [])[1] ??
      ''
    )

    // Download link: class contains "link-download"
    const dlM = tabContent.match(/class="[^"]*link-download[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-download[^"]*"/)
    const downloadUrl = normalizeMediaUrl(
      dlM?.[1] ??
      dlM?.[2] ??
      (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/link\/[^"]+)"/) || [])[1] ??
      ''
    )

    // File size: <span class="font-size-14 ...">934.0 MB</span>
    const sizeM = tabContent.match(/class="font-size-14[^"]*">([^<]+(?:MB|GB))/i)
    const size = sizeM ? sizeM[1].trim() : undefined

    if (watchUrl || downloadUrl) {
      options.push({ label, tabId, watchUrl, downloadUrl, size })
    }
  }

  return options
}

/**
 * Extract direct MP4/video sources: <source src="..." type="video/mp4" size="720" />
 */
function extractVideoSources(html: string): VideoSource[] {
  const sources: VideoSource[] = []
  const seen = new Set<string>()

  const pushSource = (src: string, type: string, size = '') => {
    if (!src) return
    const normalized = src
      .replace(/&amp;/g, '&')
      .replace(/^\/\//, 'https://')
      .trim()
    if (!/^https?:\/\//i.test(normalized)) return
    if (seen.has(normalized)) return
    seen.add(normalized)
    sources.push({ src: normalized, type, size })
  }

  // Highest priority: official download button block on ak.sv/download pages.
  const btnLoaderRe = /<div[^>]*class="[^"]*btn-loader[^"]*"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*download[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = btnLoaderRe.exec(html)) !== null) {
    pushSource(m[1], 'video/mp4')
  }

  // Fallback: any anchor with download attribute that points to media.
  const downloadAnchorRe = /<a[^>]+href="([^"]+)"[^>]*download[^>]*>/gi
  while ((m = downloadAnchorRe.exec(html)) !== null) {
    const href = m[1]
    if (/\.(mp4|mkv|avi|webm)(\?|$)/i.test(href) || href.includes('/download/')) {
      pushSource(href, 'video/mp4')
    }
  }

  const re = /<source[^>]+>/gi
  while ((m = re.exec(html)) !== null) {
    const tag = m[0]
    const srcM = tag.match(/src="([^"]+)"/)
    const typeM = tag.match(/type="(video\/[^"]+)"/)
    const sizeM = tag.match(/size="(\d+)"/)
    if (srcM && typeM) {
      pushSource(srcM[1], typeM[1], sizeM?.[1] ?? '')
    }
  }

  // Some ak.sv/download pages expose a direct MP4 href without <source> tags.
  const mp4Re = /https?:\/\/[^\s"'<>]+\.mp4/gi
  while ((m = mp4Re.exec(html)) !== null) {
    pushSource(m[0], 'video/mp4')
  }

  return sources
}

/**
 * Scrape an ak.sv/watch/... page for quality options and video sources
 */
async function scrapeWatchPage(watchUrl: string): Promise<Omit<WatchData, 'watchPageUrl'>> {
  const url = watchUrl.startsWith('http') ? watchUrl : `https://ak.sv${watchUrl}`
  const html = await fetchHtml(url)

  // Title
  const titleM =
    html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ??
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const title = titleM
    ? titleM[1]
        .replace(/<[^>]+>/g, '')
        .replace(/^\s*مشاهدة\s+/u, '')
        .trim()
    : ''

  // Poster
  const posterPatterns = [
    /https?:\/\/img\.downet\.net\/(?!thumb)[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
    /https?:\/\/img\.akwam\.net\/uploads\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
    /https?:\/\/img\.downet\.net\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
  ]
  let poster = ''
  for (const pat of posterPatterns) {
    const pm = html.match(pat)
    if (pm) {
      poster = pm[0].split(/["'\s<>]/)[0]
      break
    }
  }

  const labels = extractQualityLabels(html)
  const qualities = extractQualityOptions(html, labels)
  const videoSources = extractVideoSources(html)

  // Attach direct video source to matching quality option
  for (const q of qualities) {
    const numLabel = q.label.replace(/[^0-9]/g, '')
    const match = videoSources.find(vs => vs.size === numLabel || vs.size === q.tabId)
    if (match) q.videoSrc = match.src
  }

  // If quality tab parsing found nothing but video sources exist, synthesize entries
  if (qualities.length === 0 && videoSources.length > 0) {
    for (const vs of videoSources) {
      qualities.push({
        label: `${vs.size}p`,
        tabId: vs.size,
        watchUrl: '',
        downloadUrl: '',
        videoSrc: vs.src,
      })
    }
  }

  return { title, poster, qualities, videoSources }
}

/**
 * Main entry point: given a go.ak.sv watch URL (or directly an ak.sv/watch URL),
 * resolve and scrape quality + video data.
 */
export async function fetchWatchData(goWatchUrl: string): Promise<WatchData> {
  const normalizedInput = normalizeMediaUrl(goWatchUrl)
  // Must match exactly ak.sv (not subdomains like go.ak.sv)
  const isAksvMediaPage = /^https?:\/\/(?:www\.)?ak\.sv\/(?:watch|download)\//.test(normalizedInput)
  const watchPageUrl = isAksvMediaPage ? normalizedInput : await resolveGoUrl(normalizedInput)
  const data = await scrapeWatchPage(watchPageUrl)
  return { ...data, watchPageUrl }
}

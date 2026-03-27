const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: REQUEST_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

async function resolveGoUrl(goUrl) {
  const html = await fetchHtml(goUrl)
  const m = html.match(/href="(https?:\/\/ak\.sv\/(?:watch|download)\/[^"]+)"/)
  if (m) return m[1]
  const altM = html.match(/href="(https?:\/\/[a-z0-9.-]+\/(?:watch|download)\/\d+\/\d+\/[^"]+)"/)
  if (altM) return altM[1].replace(/^https?:\/\/[^/]+/, 'https://ak.sv')
  throw new Error('Could not resolve')
}

const resolved = await resolveGoUrl('https://go.ak.sv/link/171599')
const html = await fetchHtml(resolved)
const source = html.match(/<source[\s\S]*?src="([^"]+)"/i)?.[1] ?? ''

console.log('resolved:', resolved)
console.log('hasSource:', !!source)
console.log('source:', source.slice(0, 90))

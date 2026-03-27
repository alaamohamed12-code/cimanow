const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: REQUEST_HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

const url = 'https://go.ak.sv/link/171599'
const html = await fetchHtml(url)

console.log('Length:', html.length)

const hrefRe = /href="(https?:\/\/[^"]+)"/gi
let m
const links = []
while ((m = hrefRe.exec(html)) !== null) {
  const u = m[1]
  if (u.includes('/watch/') || u.includes('/link/') || u.includes('downet') || u.includes('ak.sv')) {
    links.push(u)
  }
}

console.log('Interesting links:')
for (const l of links.slice(0, 20)) {
  console.log('-', l)
}

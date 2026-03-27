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

const url = 'https://ak.sv/download/171599/10867/hijacked'
const html = await fetchHtml(url)

console.log('Length:', html.length)

const directMp4 = html.match(/https?:\/\/[^\s"']+\.mp4/gi) || []
console.log('Direct mp4 count:', directMp4.length)
if (directMp4[0]) console.log('First mp4:', directMp4[0])

const goLink = html.match(/href="(https?:\/\/go\.ak\.sv\/link\/[^"]+)"/i)
console.log('go link:', goLink?.[1] || 'none')

const dnLink = html.match(/href="(https?:\/\/[^"]*downet[^\"]+)"/i)
console.log('downet href:', dnLink?.[1] || 'none')

const fileLinkRe = /href="(https?:\/\/[^"]+)"/gi
let m
let printed = 0
while ((m = fileLinkRe.exec(html)) !== null && printed < 20) {
  const u = m[1]
  if (u.includes('download/') || u.includes('downet') || u.includes('/link/') || u.includes('/watch/')) {
    console.log('-', u)
    printed++
  }
}

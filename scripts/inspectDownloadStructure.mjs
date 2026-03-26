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

const html = await fetchHtml('https://ak.sv/download/171599/10867/hijacked')

const qualityTabs = [...html.matchAll(/href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ id: m[1], label: m[2].replace(/<[^>]+>/g, '').trim() }))
console.log('qualityTabs:', qualityTabs)

const tabBlocks = [...html.matchAll(/<div\s+class="tab-content quality"[^>]+id="tab-(\d+)"[^>]*>([\s\S]*?)(?=<div\s+class="tab-content|<\/div>\s*<\/div>\s*<\/div>\s*<div\s+class="text-left)/gi)]
console.log('tab blocks:', tabBlocks.length)

const directMp4 = [...new Set((html.match(/https?:\/\/[^\s"']+\.mp4/gi) || []))]
console.log('mp4 count:', directMp4.length)
console.log('mp4 sample:', directMp4.slice(0, 3))

const downetHrefs = [...new Set([...html.matchAll(/href="(https?:\/\/[^\"]*downet[^\"]+)"/gi)].map(m => m[1]))]
console.log('downet hrefs count:', downetHrefs.length)
console.log('downet href sample:', downetHrefs.slice(0, 3))

// Replicate EXACTLY what fetchWatchData.ts does, using native fetch
const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
};

async function fetchHtml(url) {
  console.log('[fetchHtml]', url);
  const res = await fetch(url, { headers: REQUEST_HEADERS });
  console.log('[fetchHtml] status:', res.status, 'url:', res.url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// resolveGoUrl
const goUrl = 'https://go.ak.sv/watch/171599';
const html = await fetchHtml(goUrl);
const m0 = html.match(/href="(https?:\/\/ak\.sv\/watch\/[^"]+)"/);
console.log('resolveGoUrl result:', m0 ? m0[1] : 'NOT FOUND');

if (!m0) { console.error('FAILED at resolveGoUrl'); process.exit(1); }
const watchUrl = m0[1];

// scrapeWatchPage
const watchHtml = await fetchHtml(watchUrl);
console.log('Watch HTML length:', watchHtml.length);

// extractQualityLabels
const labelsMap = new Map();
const labelRe = /href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
let m;
while ((m = labelRe.exec(watchHtml)) !== null) {
  const label = m[2].replace(/<[^>]+>/g, '').trim();
  if (label) labelsMap.set(m[1], label);
}
console.log('\nQuality labels:', Object.fromEntries(labelsMap));

// extractQualityOptions
const tabRe = /<div\s+class="tab-content quality"[^>]+id="tab-(\d+)"[^>]*>([\s\S]*?)(?=<div\s+class="tab-content|<\/div>\s*<\/div>\s*<\/div>\s*<div\s+class="text-left)/gi;
let tabCount = 0;
const qualities = [];
while ((m = tabRe.exec(watchHtml)) !== null) {
  tabCount++;
  const tabId = m[1];
  const tabContent = m[2];
  const label = labelsMap.get(tabId) ?? `${tabId}p`;
  const watchM = tabContent.match(/class="[^"]*link-show[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-show[^"]*"/);
  const watchUrl2 = watchM?.[1] ?? watchM?.[2] ?? (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/watch\/[^"]+)"/) || [])[1] ?? '';
  const dlM = tabContent.match(/class="[^"]*link-download[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-download[^"]*"/);
  const downloadUrl = dlM?.[1] ?? dlM?.[2] ?? (tabContent.match(/href="(https?:\/\/go\.ak\.sv\/link\/[^"]+)"/) || [])[1] ?? '';
  const sizeM = tabContent.match(/class="font-size-14[^"]*">([^<]+(?:MB|GB))/i);
  const size = sizeM ? sizeM[1].trim() : undefined;
  if (watchUrl2 || downloadUrl) {
    qualities.push({ label, tabId, watchUrl: watchUrl2, downloadUrl, size });
  }
}
console.log('Total tabs found:', tabCount);
console.log('Quality options:', JSON.stringify(qualities, null, 2));

// extractVideoSources
const sourceRe = /<source[^>]+>/gi;
const videoSources = [];
while ((m = sourceRe.exec(watchHtml)) !== null) {
  const tag = m[0];
  const srcM = tag.match(/src="([^"]+)"/);
  const typeM = tag.match(/type="(video\/[^"]+)"/);
  const sizeM = tag.match(/size="(\d+)"/);
  if (srcM && typeM) {
    videoSources.push({ src: srcM[1], type: typeM[1], size: sizeM?.[1] ?? '' });
  }
}
console.log('\nVideo sources:', JSON.stringify(videoSources, null, 2));

// Match videoSrc to quality
for (const q of qualities) {
  const numLabel = q.label.replace(/[^0-9]/g, '');
  const match = videoSources.find(vs => vs.size === numLabel || vs.size === q.tabId);
  if (match) q.videoSrc = match.src;
}

// Fallback
if (qualities.length === 0 && videoSources.length > 0) {
  for (const vs of videoSources) {
    qualities.push({ label: `${vs.size}p`, tabId: vs.size, watchUrl: '', downloadUrl: '', videoSrc: vs.src });
  }
}

console.log('\n=== FINAL RESULT ===');
console.log('qualities.length:', qualities.length);
console.log('videoSources.length:', videoSources.length);
console.log('qualities[0]?.videoSrc:', qualities[0]?.videoSrc);
console.log('videoSources[0]?.src:', videoSources[0]?.src);

const currentVideoSrc = qualities[0]?.videoSrc ?? videoSources[0]?.src;
console.log('\ncurrentVideoSrc (what browser would load):', currentVideoSrc);

// Test using Node.js native fetch (same as Next.js uses)
const goUrl = 'https://go.ak.sv/watch/171599';

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
};

async function fetchHtml(url) {
  console.log('Fetching:', url);
  const res = await fetch(url, { headers: REQUEST_HEADERS });
  console.log('Status:', res.status, 'URL:', res.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// Step 1: Fetch go.ak.sv page
const goHtml = await fetchHtml(goUrl);
console.log('Go page length:', goHtml.length);

// Find watch URL
const m = goHtml.match(/href="(https?:\/\/ak\.sv\/watch\/[^"]+)"/);
if (!m) {
  console.error('ERROR: Could not find watch URL in go.ak.sv page!');
  // Show a snippet to help debug
  const idx = goHtml.indexOf('watch');
  console.log('Snippet around "watch":', goHtml.slice(Math.max(0, idx-50), idx+200));
  process.exit(1);
}
const watchUrl = m[1];
console.log('Resolved watch URL:', watchUrl);

// Step 2: Fetch the watch page
const watchHtml = await fetchHtml(watchUrl);
console.log('Watch page length:', watchHtml.length);

// Step 3: Extract video sources
const sourceRe = /<source[^>]+>/gi;
let match;
const sources = [];
while ((match = sourceRe.exec(watchHtml)) !== null) {
  const tag = match[0];
  const srcM = tag.match(/src="([^"]+)"/);
  const typeM = tag.match(/type="(video\/[^"]+)"/);
  const sizeM = tag.match(/size="(\d+)"/);
  if (srcM && typeM) {
    sources.push({ src: srcM[1], type: typeM[1], size: sizeM ? sizeM[1] : '' });
  }
}
console.log('\nVideo sources found:', JSON.stringify(sources, null, 2));

// Step 4: Extract quality labels
const labelsMap = new Map();
const labelRe = /href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
while ((match = labelRe.exec(watchHtml)) !== null) {
  const label = match[2].replace(/<[^>]+>/g, '').trim();
  if (label) labelsMap.set(match[1], label);
}
console.log('Quality labels:', Object.fromEntries(labelsMap));

// Step 5: Test if video URL is accessible
if (sources.length > 0) {
  console.log('\nTesting video URL accessibility...');
  const videoUrl = sources[0].src;
  try {
    const videoRes = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': REQUEST_HEADERS['User-Agent'],
        'Referer': 'https://ak.sv',
      }
    });
    console.log('Video URL status (with Referer ak.sv):', videoRes.status);
    console.log('Content-Length:', videoRes.headers.get('Content-Length'));
    console.log('Content-Type:', videoRes.headers.get('Content-Type'));
  } catch(e) {
    console.log('Video URL test error:', e.message);
  }
  
  // Test without referer
  try {
    const videoRes2 = await fetch(videoUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': REQUEST_HEADERS['User-Agent'] }
    });
    console.log('Video URL status (no Referer):', videoRes2.status);
  } catch(e) {
    console.log('Video URL (no referer) error:', e.message);
  }
}

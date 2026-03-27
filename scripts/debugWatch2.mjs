// Test the full fetchWatchData logic directly
import https from 'https';

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchHtml(res.headers.location));
        return;
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

// Test 1: Resolve go URL
const goHtml = await fetchHtml('https://go.ak.sv/watch/171599');
const goM = goHtml.match(/href="(https?:\/\/ak\.sv\/watch\/[^"]+)"/);
console.log('Resolved watch URL:', goM ? goM[1] : 'NOT FOUND');

const watchUrl = goM ? goM[1] : null;
if (!watchUrl) process.exit(1);

// Test 2: Scrape watch page
const watchHtml = await fetchHtml(watchUrl);
console.log('Watch HTML length:', watchHtml.length);

// Test quality labels
const labelsMap = new Map();
const labelRe = /href="#tab-(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
let m;
while ((m = labelRe.exec(watchHtml)) !== null) {
  const label = m[2].replace(/<[^>]+>/g, '').trim();
  if (label) labelsMap.set(m[1], label);
}
console.log('Quality labels:', Object.fromEntries(labelsMap));

// Test quality tab content
const tabRe = /<div\s+class="tab-content quality"[^>]+id="tab-(\d+)"[^>]*>([\s\S]*?)(?=<div\s+class="tab-content|<\/div>\s*<\/div>\s*<\/div>\s*<div\s+class="text-left)/gi;
let tabCount = 0;
while ((m = tabRe.exec(watchHtml)) !== null) {
  tabCount++;
  console.log(`Tab ${m[1]} content length: ${m[2].length}`);
  const watchM = m[2].match(/class="[^"]*link-show[^"]*"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*class="[^"]*link-show[^"]*"/);
  console.log(`  watchUrl: ${watchM ? (watchM[1] || watchM[2]) : 'NOT FOUND'}`);
}
console.log('Total tabs found:', tabCount);

// Test video sources
const sourceRe = /<source[^>]+>/gi;
const sources = [];
while ((m = sourceRe.exec(watchHtml)) !== null) {
  const tag = m[0];
  const srcM = tag.match(/src="([^"]+)"/);
  const typeM = tag.match(/type="(video\/[^"]+)"/);
  const sizeM = tag.match(/size="(\d+)"/);
  if (srcM && typeM) {
    sources.push({ src: srcM[1], type: typeM[1], size: sizeM ? sizeM[1] : '' });
  }
}
console.log('Video sources found:', sources);

// Check if source tag is inside HTML comment
const commentRe = /<!--[\s\S]*?-->/g;
const comments = [];
while ((m = commentRe.exec(watchHtml)) !== null) {
  if (m[0].includes('<source')) {
    comments.push('Source tag INSIDE COMMENT - will be skipped');
  }
}
if (comments.length > 0) console.log('WARNING:', comments);

// Check where <source> actually appears
const sourceIdx = watchHtml.indexOf('<source');
if (sourceIdx > -1) {
  // Check if it's inside a comment
  const before = watchHtml.slice(0, sourceIdx);
  const lastOpenComment = before.lastIndexOf('<!--');
  const lastCloseComment = before.lastIndexOf('-->');
  const isInComment = lastOpenComment > lastCloseComment;
  console.log('Source at index:', sourceIdx, '| Inside comment?', isInComment);
}

import https from 'https';

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) { reject(new Error('Too many redirects')); return; }
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en-US;q=0.9',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchUrl(res.headers.location, redirectCount + 1));
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body, url }));
    });
    req.on('error', reject);
  });
}

console.log('=== Testing go.ak.sv/watch/171599 ===');
const goResult = await fetchUrl('https://go.ak.sv/watch/171599');
console.log('STATUS:', goResult.status, 'URL:', goResult.url);
console.log('BODY LENGTH:', goResult.body.length);

// Find watch links in go page
const watchLinkRe = /href="(https?:\/\/[^"]+\/watch\/[^"]+)"/gi;
const watchLinks = [];
let m;
while ((m = watchLinkRe.exec(goResult.body)) !== null) {
  watchLinks.push(m[1]);
}
console.log('WATCH LINKS FOUND:', watchLinks);

// Find ak.sv links
const aksvRe = /href="(https?:\/\/ak\.sv[^"]+)"/gi;
const aksvLinks = [];
while ((m = aksvRe.exec(goResult.body)) !== null) {
  aksvLinks.push(m[1]);
}
console.log('AK.SV LINKS:', aksvLinks.slice(0, 10));

// Show snippet around "watch"
const idx = goResult.body.indexOf('/watch/');
if (idx > -1) {
  console.log('SNIPPET around /watch/:', goResult.body.slice(Math.max(0, idx-100), idx+200));
}

// If we found a watch URL, also fetch that
if (watchLinks.length > 0) {
  console.log('\n=== Testing ak.sv watch page ===');
  const watchUrl = watchLinks[0];
  console.log('Fetching:', watchUrl);
  const watchResult = await fetchUrl(watchUrl);
  console.log('STATUS:', watchResult.status);
  
  // Find source tags
  const sourceRe = /<source[^>]+>/gi;
  const sources = [];
  while ((m = sourceRe.exec(watchResult.body)) !== null) {
    sources.push(m[0]);
  }
  console.log('SOURCE TAGS:', sources);
  
  // Check if video section exists
  const videoIdx = watchResult.body.indexOf('<video');
  if (videoIdx > -1) {
    console.log('VIDEO TAG SNIPPET:', watchResult.body.slice(videoIdx, videoIdx + 500));
  }
}

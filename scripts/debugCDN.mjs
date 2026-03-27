// Test CDN video URL accessibility - with SSL bypass (simulate browser)
import https from 'https';

const videoUrl = 'https://s203d1.downet.net/download/1774249102/69bf930e34cf2/Hijacked.2025.WEB-DL.AKWAM.mp4';

function testUrl(url, options, label) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'HEAD',
      rejectUnauthorized: false,  // Skip SSL verification (browser behavior)
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'video/webm,video/mp4,video/*,*/*;q=0.9',
        'Accept-Language': 'ar,en-US;q=0.9',
        'Accept-Encoding': 'identity;q=1, *;q=0',
        'Sec-Fetch-Dest': 'video',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
        ...options,
      },
      ...{ rejectUnauthorized: false }
    };
    const req = https.request(reqOptions, (res) => {
      console.log(`[${label}] Status: ${res.statusCode} | Content-Type: ${res.headers['content-type']} | Content-Length: ${res.headers['content-length']}`);
      resolve(res.statusCode);
    });
    req.on('error', e => { console.log(`[${label}] Error: ${e.message}`); resolve(null); });
    req.on('timeout', () => { req.destroy(); console.log(`[${label}] TIMEOUT`); resolve(null); });
    req.end();
  });
}

console.log('Testing video URL with browser-like settings (SSL verification disabled):');
console.log('URL:', videoUrl);
console.log('');

await testUrl(videoUrl, { 'Referer': 'https://ak.sv/watch/171599/10867/hijacked' }, 'Referer=ak.sv/watch');
await testUrl(videoUrl, { 'Referer': 'https://ak.sv' }, 'Referer=ak.sv');
await testUrl(videoUrl, {}, 'No special headers');
await testUrl(videoUrl, { 'Referer': 'https://localhost:3000' }, 'Referer=localhost');

// Focused test: check ak.sv X-Frame-Options + video CDN accessibility
import https from 'https';

function httpHead(url, extraHeaders = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        ...extraHeaders
      },
      timeout: 10000,
    };
    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, xfo: res.headers['x-frame-options'], csp: res.headers['content-security-policy'], cors: res.headers['access-control-allow-origin'], ct: res.headers['content-type'], cl: res.headers['content-length'] });
    });
    req.on('error', e => resolve({ error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.end();
  });
}

// Test 1: ak.sv/watch page iframe headers
console.log('Test 1: ak.sv/watch page headers...');
const watchHeaders = await httpHead('https://ak.sv/watch/171599/10867/hijacked');
console.log('ak.sv/watch result:', JSON.stringify(watchHeaders));

// Test 2: CDN video URL access with Referer: ak.sv
const videoUrl = 'https://s203d1.downet.net/download/1774248713/69bf9189c1d79/Hijacked.2025.WEB-DL.AKWAM.mp4';
console.log('\nTest 2: CDN with Referer: ak.sv');
const cdn1 = await httpHead(videoUrl, { 'Referer': 'https://ak.sv' });
console.log('CDN result:', JSON.stringify(cdn1));

console.log('\nTest 3: CDN with no Referer');
const cdn2 = await httpHead(videoUrl);
console.log('CDN result:', JSON.stringify(cdn2));

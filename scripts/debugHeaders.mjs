// Test ak.sv/watch page headers to check iframe embedding eligibility
import https from 'https';

function headUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD', headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    }}, (res) => {
      const headers = {};
      for (const [k, v] of Object.entries(res.headers)) {
        if (['x-frame-options','content-security-policy','access-control-allow-origin','location'].includes(k.toLowerCase())) {
          headers[k] = v;
        }
      }
      resolve({ status: res.statusCode, headers });
    });
    req.on('error', reject);
    req.end();
  });
}

console.log('=== Checking ak.sv/watch headers ===');
try {
  const result = await headUrl('https://ak.sv/watch/171599/10867/hijacked');
  console.log('Status:', result.status);
  console.log('Relevant headers:', result.headers);
} catch(e) {
  console.log('Error:', e.message);
}

// Also check the CDN video URL headers
console.log('\n=== Checking CDN video URL headers ===');
// First get a fresh URL
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar',
      }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

const goHtml = await fetchHtml('https://go.ak.sv/watch/171599');
const watchM = goHtml.match(/href="(https?:\/\/ak\.sv\/watch\/[^"]+)"/);
if (watchM) {
  const watchHtml = await fetchHtml(watchM[1]);
  const srcM = watchHtml.match(/src="(https?:\/\/s203d1\.downet\.net\/[^"]+)"/);
  if (srcM) {
    const videoUrl = srcM[1];
    console.log('Video URL:', videoUrl);
    
    // Test with different referer values
    for (const referer of ['https://ak.sv', 'https://localhost:3000', '', null]) {
      const req = https.request(videoUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...(referer !== null ? { 'Referer': referer } : {}),
        }
      }, (res) => {
        console.log(`Status with Referer="${referer}":`, res.statusCode, 
          '| Content-Type:', res.headers['content-type'],
          '| Content-Length:', res.headers['content-length'],
          '| CORS:', res.headers['access-control-allow-origin']);
      });
      req.on('error', e => console.log(`Error with Referer="${referer}":`, e.message));
      req.end();
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

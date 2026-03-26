// Check go.ak.sv/watch/171599 to see what it returns
const res = await fetch('https://go.ak.sv/watch/171599', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://ak.sv/'
  },
  redirect: 'manual'
});

console.log('Status:', res.status);
console.log('Location:', res.headers.get('location'));
console.log('Content-Type:', res.headers.get('content-type'));

if (res.status === 200) {
  const html = await res.text();
  console.log('HTML length:', html.length);
  console.log('First 1000 chars:', html.slice(0, 1000));
  
  // Find iframes
  const iframes = html.match(/iframe[^>]+src="([^"]+)"/g) || [];
  console.log('IFRAMES:', JSON.stringify(iframes));
  
  // Find video sources
  const m3u8 = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/g) || [];
  const mp4 = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/g) || [];
  console.log('M3U8:', JSON.stringify(m3u8.slice(0,3)));
  console.log('MP4:', JSON.stringify(mp4.slice(0,3)));
  
  // Find file: pattern
  const fileSrc = html.match(/file\s*:\s*["']([^"']+)/g) || [];
  console.log('FILE SOURCES:', JSON.stringify(fileSrc.slice(0,5)));
}

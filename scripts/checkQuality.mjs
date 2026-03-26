// Deep look at watch page quality section HTML structure
const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml'
  }
}).then(r => r.text());

// Find the section around "مشاهدة وتحميل"
const idx = html.indexOf('\u0645\u0634\u0627\u0647\u062f\u0629 \u0648\u062a\u062d\u0645\u064a\u0644');
if (idx !== -1) {
  const chunk = html.slice(idx - 100, idx + 3000);
  // Print raw HTML 
  console.log('RAW HTML AROUND QUALITY SECTION:');
  console.log(chunk);
}

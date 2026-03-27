import fs from 'fs';

const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml'
  }
}).then(r => r.text());

// Find all quality tabs - look for the tab structure
const tabListIdx = html.indexOf('id="tab-');
console.log('First tab-id at:', tabListIdx);

// Get full chunk around quality area
const qualIdx = html.indexOf('#tab-');
if (qualIdx !== -1) {
  const chunk = html.slice(qualIdx - 200, qualIdx + 3000);
  fs.writeFileSync('./scripts/quality_tabs.html', chunk);
  console.log('Saved quality_tabs.html (', chunk.length, 'chars)');
}

// Extract quality labels
const qualLabels = [...html.matchAll(/href="#tab-(\d+)"[^>]*>(.*?)<\/a>/gi)];
qualLabels.forEach(m => console.log('QUALITY LABEL:', m[1], '→', m[2].trim()));

// Extract source elements  
const srcElements = [...html.matchAll(/<source[^>]+src="([^"]+)"[^>]*size="(\d+)"[^>]*>/gi)];
console.log('\nVIDEO SOURCES WITH SIZE:');
srcElements.forEach(m => console.log('SIZE:', m[2], 'SRC:', m[1]));

// Download button context
const dlIdx = html.indexOf('link-download');
if (dlIdx !== -1) {
  console.log('\nDOWNLOAD BUTTON CONTEXT:');
  console.log(html.slice(dlIdx - 100, dlIdx + 400));
}

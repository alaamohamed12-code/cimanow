import fs from 'fs';

// Deep look at watch page quality section HTML structure
const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml'
  }
}).then(r => r.text());

// Save to file for inspection
fs.writeFileSync('./scripts/watch_output.html', html);

// Find quality section
const label = 'مشاهدة وتحميل';
const idx = html.indexOf(label);
console.log('Quality section index:', idx);

if (idx !== -1) {
  const chunk = html.slice(idx - 50, idx + 4000);
  fs.writeFileSync('./scripts/quality_chunk.html', chunk);
  console.log('Saved quality_chunk.html');
  
  // Find all links containing go.ak.sv
  const goLinkPattern = /href="(https?:\/\/go\.ak\.sv\/[^"]+)"/g;
  let m;
  while ((m = goLinkPattern.exec(chunk)) !== null) {
    console.log('GO LINK:', m[1]);
    // Get surrounding context
    const start = Math.max(0, m.index - 200);
    const end = Math.min(chunk.length, m.index + 200);
    const context = chunk.slice(start, end).replace(/\s+/g, ' ');
    console.log('CONTEXT:', context);
    console.log('---');
  }
}

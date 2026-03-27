const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml'
  }
}).then(r => r.text());

// Find all video sources
const sources = [...html.matchAll(/<source[^>]+>/gi)].map(m => m[0]);
console.log('VIDEO SOURCES:');
sources.forEach((s, i) => console.log(`[${i}]`, s));

// Find quality table rows - look for go.ak.sv link context
const goLinks = [...html.matchAll(/href="(http:\/\/go\.ak\.sv\/(?:watch|link)\/\d+)"/g)];
console.log('\nGO LINKS COUNT:', goLinks.length);

// Get context around first go watch link
const firstGoIdx = html.indexOf('go.ak.sv/watch/');
if (firstGoIdx !== -1) {
  const chunk = html.slice(firstGoIdx - 500, firstGoIdx + 500);
  console.log('\nCONTEXT around go.ak.sv/watch:');
  console.log(chunk);
}

// Find quality rows pattern
const qualRows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
console.log('\nQUALITY ROWS',  qualRows.length, 'total');
qualRows.forEach((row, i) => {
  if (row[0].includes('go.ak.sv')) {
    console.log(`ROW[${i}]:`, row[0].replace(/\s+/g, ' '));
    console.log('---');
  }
});

// Find all td with quality labels 
const tds = [...html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
console.log('\nTD COUNT:', tds.length);
tds.slice(0, 30).forEach((td, i) => {
  const clean = td[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length > 0 && clean.length < 100) {
    console.log(`TD[${i}]:`, clean);
  }
});

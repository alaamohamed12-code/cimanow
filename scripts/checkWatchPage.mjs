// Deep inspection of ak.sv/watch page
const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'ar,en-US;q=0.9'
  }
}).then(r => r.text());

// Check scripts for player setup
const scriptParts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
scriptParts.forEach((s, i) => {
  const content = s.replace(/<\/?script[^>]*>/gi, '').trim();
  if (content.length > 50) {
    console.log(`SCRIPT[${i}] (${content.length} chars):`, content.slice(0, 600));
    console.log('---');
  }
});

// Find all go.ak.sv links
const goLinks = html.match(/go\.ak\.sv\/[^\s"'<>]+/g) || [];
console.log('ALL GO LINKS:', JSON.stringify([...new Set(goLinks)]));

// Find quality labels and links
const qualRows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
qualRows.slice(0, 10).forEach((row, i) => {
  const clean = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > 5) console.log(`ROW[${i}]:`, clean.slice(0, 300));
});

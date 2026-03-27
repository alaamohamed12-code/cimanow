import fs from 'fs';

const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml'
  }
}).then(r => r.text());

fs.writeFileSync('./scripts/watch_full.html', html);
console.log('HTML length:', html.length);
console.log('Contains go.ak.sv:', html.includes('go.ak.sv'));

// Find all go.ak.sv instances
const goLinks = [...html.matchAll(/href="([^"]*go\.ak\.sv[^"]*)"/g)].map(m => m[1]);
console.log('GO LINKS:', JSON.stringify(goLinks));

// Find the character codes for قسم/جودة matching
const idx1 = html.indexOf('720');
const idx2 = html.indexOf('1080');
console.log('720 at:', idx1, '| 1080 at:', idx2);
if (idx1 !== -1) {
  console.log('Context around 720:', html.slice(idx1 - 300, idx1 + 300).replace(/[\r\n]+/g, ' '));
}

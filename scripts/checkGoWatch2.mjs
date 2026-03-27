// Check go.ak.sv/watch/171599 to see full HTML
const res = await fetch('https://go.ak.sv/watch/171599', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://ak.sv/'
  }
});

const html = await res.text();

// Find any links in the page
const allLinks = html.match(/href="([^"]+)"/g) || [];
console.log('ALL HREFS:', JSON.stringify(allLinks.slice(0, 20)));

// Find onclick or data attributes
const onclick = html.match(/onclick="([^"]+)"/g) || [];
console.log('ONCLICK:', JSON.stringify(onclick.slice(0, 10)));

// Find data attributes  
const dataAttrs = html.match(/data-[a-z]+="([^"]+)"/g) || [];
console.log('DATA ATTRS:', JSON.stringify(dataAttrs.slice(0, 10)));

// Find button/a tags
const buttons = html.match(/<(?:button|a)[^>]*>[\s\S]*?<\/(?:button|a)>/gi) || [];
console.log('BUTTONS/LINKS COUNT:', buttons.length);
buttons.slice(0, 10).forEach((b, i) => {
  console.log(`BTN[${i}]:`, b.replace(/\s+/g,' ').slice(0, 200));
});

// Check for countdown/redirect scripts
const scriptParts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
scriptParts.slice(0, 5).forEach((s, i) => {
  const content = s.replace(/<\/?script[^>]*>/gi, '').trim();
  if (content.length > 10) {
    console.log(`SCRIPT[${i}]:`, content.slice(0, 500));
  }
});

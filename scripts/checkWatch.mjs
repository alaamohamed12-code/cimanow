const html = await fetch('https://ak.sv/watch/171599/10867/hijacked', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
  }
}).then(r => r.text());

// Look for iframes
const iframes = html.match(/iframe[^>]+src="([^"]+)"/g) || [];
console.log('IFRAMES:', JSON.stringify(iframes.slice(0, 5)));

// Look for go links
const goWatchLinks = html.match(/go\.ak\.sv\/watch\/\d+/g) || [];
console.log('GO WATCH LINKS:', JSON.stringify([...new Set(goWatchLinks)]));

// Find quality/watch section
const qualIdx = html.indexOf('\u0645\u0634\u0627\u0647\u062f\u0629 \u0648\u062a\u062d\u0645\u064a\u0644');
if (qualIdx !== -1) {
  const chunk = html.slice(qualIdx, qualIdx + 3000);
  const clean = chunk.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  console.log('QUALITY SECTION:', clean.slice(0, 800));
}

// Look for video player
const playerIdx = html.indexOf('episode-player');
console.log('HAS episode-player:', playerIdx !== -1);
const jwIdx = html.indexOf('jwplayer');
console.log('HAS jwplayer:', jwIdx !== -1);
const playerSrc = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)/g) || html.match(/file:\s*["']([^"']+\.mp4[^"']*)/g) || [];
console.log('PLAYER FILE SOURCES:', JSON.stringify(playerSrc.slice(0, 3)));

// Save raw chunk around player  
const scriptMatches = html.match(/<script[^>]*>[\s\S]*?jwplayer[\s\S]*?<\/script>/gi) || [];
if (scriptMatches.length > 0) {
  console.log('JW SCRIPT:', scriptMatches[0].slice(0, 1000));
}

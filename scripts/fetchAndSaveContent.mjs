// scripts/fetchAndSaveContent.mjs
// سكريبت لجلب بيانات الأفلام والمسلسلات والبرامج وتخزينها في ملفات JSON محليًا
import fs from 'fs';
import fetch from 'node-fetch';

const endpoints = [
  { url: 'http://localhost:3000/api/movies/list?page=1', file: './lib/movies.json' },
  { url: 'http://localhost:3000/api/series/list?page=1', file: './lib/series.json' },
  { url: 'http://localhost:3000/api/shows/list?page=1', file: './lib/shows.json' }
];

async function fetchAndSave() {
  for (const { url, file } of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`${file} saved!`);
    } catch (e) {
      console.error(`Failed to fetch/save for ${url}:`, e);
    }
  }
}

fetchAndSave();

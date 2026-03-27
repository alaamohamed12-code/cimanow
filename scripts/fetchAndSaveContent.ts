// scripts/fetchAndSaveContent.ts
// سكريبت TypeScript لجلب بيانات الأفلام والمسلسلات والبرامج وتخزينها في ملفات JSON محليًا
import { getMoviesListing } from '../lib/fetchMoviesListing';
import { getSeriesListing } from '../lib/fetchSeriesListing';
import { getShowsListing } from '../lib/fetchShowsListing';
import fs from 'fs';

async function fetchAndSave() {
  try {
    const movies = await getMoviesListing(1, {}, undefined);
    fs.writeFileSync('./lib/movies.json', JSON.stringify(movies, null, 2), 'utf-8');
    console.log('movies.json saved!');
  } catch (e) {
    console.error('Failed to fetch/save movies:', e);
  }
  try {
    const series = await getSeriesListing(1, {}, undefined);
    fs.writeFileSync('./lib/series.json', JSON.stringify(series, null, 2), 'utf-8');
    console.log('series.json saved!');
  } catch (e) {
    console.error('Failed to fetch/save series:', e);
  }
  try {
    const shows = await getShowsListing(1, {}, undefined);
    fs.writeFileSync('./lib/shows.json', JSON.stringify(shows, null, 2), 'utf-8');
    console.log('shows.json saved!');
  } catch (e) {
    console.error('Failed to fetch/save shows:', e);
  }
}

fetchAndSave();

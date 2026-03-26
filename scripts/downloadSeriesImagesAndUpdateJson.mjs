// scripts/downloadSeriesImagesAndUpdateJson.mjs
// Script to download all series images and update series.json to use local image paths
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const seriesJsonPath = path.resolve('./lib/series.json');
const imagesDir = path.resolve('./public/images/series');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const seriesData = JSON.parse(fs.readFileSync(seriesJsonPath, 'utf-8'));

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = await res.buffer();
  fs.writeFileSync(dest, buffer);
}

async function main() {
  let changed = false;
  for (const item of seriesData.items) {
    const match = item.image.match(/url=(.+)$/);
    if (!match) continue;
    const imageUrl = decodeURIComponent(match[1]);
    const ext = path.extname(imageUrl).split('?')[0] || '.webp';
    const fileName = `${item.id}${ext}`;
    const localPath = `/images/series/${fileName}`;
    const localFullPath = path.join(imagesDir, fileName);
    if (!fs.existsSync(localFullPath)) {
      try {
        await downloadImage(imageUrl, localFullPath);
        console.log(`Downloaded: ${fileName}`);
      } catch (e) {
        console.error(`Failed to download ${imageUrl}:`, e);
        continue;
      }
    }
    if (item.image !== localPath) {
      item.image = localPath;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(seriesJsonPath, JSON.stringify(seriesData, null, 2), 'utf-8');
    console.log('series.json updated with local image paths.');
  } else {
    console.log('No changes needed in series.json.');
  }
}

main();

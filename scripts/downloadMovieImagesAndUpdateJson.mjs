// scripts/downloadMovieImagesAndUpdateJson.mjs
// Script to download all movie images and update movies.json to use local image paths
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const moviesJsonPath = path.resolve('./lib/movies.json');
const imagesDir = path.resolve('./public/images/movies');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const moviesData = JSON.parse(fs.readFileSync(moviesJsonPath, 'utf-8'));

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = await res.buffer();
  fs.writeFileSync(dest, buffer);
}

async function main() {
  let changed = false;
  for (const item of moviesData.items) {
    // Extract original image URL
    const match = item.image.match(/url=(.+)$/);
    if (!match) continue;
    const imageUrl = decodeURIComponent(match[1]);
    const ext = path.extname(imageUrl).split('?')[0] || '.webp';
    const fileName = `${item.id}${ext}`;
    const localPath = `/images/movies/${fileName}`;
    const localFullPath = path.join(imagesDir, fileName);
    // Download if not exists
    if (!fs.existsSync(localFullPath)) {
      try {
        await downloadImage(imageUrl, localFullPath);
        console.log(`Downloaded: ${fileName}`);
      } catch (e) {
        console.error(`Failed to download ${imageUrl}:`, e);
        continue;
      }
    }
    // Update JSON if needed
    if (item.image !== localPath) {
      item.image = localPath;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(moviesJsonPath, JSON.stringify(moviesData, null, 2), 'utf-8');
    console.log('movies.json updated with local image paths.');
  } else {
    console.log('No changes needed in movies.json.');
  }
}

main();

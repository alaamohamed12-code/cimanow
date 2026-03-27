import fs from 'fs'
import path from 'path'
import { Content } from '@/lib/mockData'

interface ListingPayload {
  items?: Content[]
}

const readListingFile = (filename: string): Content[] => {
  const filePath = path.join(process.cwd(), 'lib', filename)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(fileContent) as ListingPayload
  return Array.isArray(parsed.items) ? parsed.items : []
}

export const getStaticMovies = (): Content[] => readListingFile('movies.json')
export const getStaticSeries = (): Content[] => readListingFile('series.json')
export const getStaticShows = (): Content[] => readListingFile('shows.json')

export const getStaticFeatured = (): Content[] => {
  const movies = getStaticMovies().slice(0, 8)
  const series = getStaticSeries().slice(0, 6)
  const shows = getStaticShows().slice(0, 6)
  return [...movies, ...series, ...shows].slice(0, 20)
}

export const getStaticHomeContent = () => ({
  featured: getStaticFeatured(),
  movies: getStaticMovies().slice(0, 20),
  series: getStaticSeries().slice(0, 20),
  shows: getStaticShows().slice(0, 20),
})

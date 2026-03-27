import fs from 'fs'
import path from 'path'
import type { Content } from '@/lib/mockData'

interface ListingSnapshot {
  items?: Content[]
}

const normalizeSearch = (value?: string) => value?.trim().toLowerCase() || ''

export const readListingSnapshot = (
  fileName: string,
  fallbackItems: Content[],
  page: number,
  search?: string
) => {
  const query = normalizeSearch(search)

  const filterItems = (items: Content[]) =>
    query
      ? items.filter((item) => {
          const title = item.title?.toLowerCase() || ''
          const description = item.description?.toLowerCase() || ''
          return title.includes(query) || description.includes(query)
        })
      : items

  try {
    const filePath = path.join(process.cwd(), 'lib', fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const snapshot = JSON.parse(fileContent) as ListingSnapshot

    return {
      items: filterItems(Array.isArray(snapshot.items) ? snapshot.items : fallbackItems),
      page,
      totalPages: 1,
      filterFields: [],
    }
  } catch (error) {
    console.error(`Snapshot read error for ${fileName}:`, error)

    return {
      items: filterItems(fallbackItems),
      page,
      totalPages: 1,
      filterFields: [],
    }
  }
}

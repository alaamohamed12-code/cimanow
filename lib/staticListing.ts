import { Content } from '@/lib/mockData'

export interface StaticListingPayload {
  items: Content[]
  page?: number
  totalPages?: number
  filterFields?: unknown[]
}

const DEFAULT_PAGE_SIZE = 24

const normalizeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : String(value ?? '').trim().toLowerCase()

export function filterStaticListing(
  data: StaticListingPayload,
  page: number,
  search?: string,
  sourceFilters: Record<string, string> = {}
): StaticListingPayload {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const query = normalizeText(search)

  let items = Array.isArray(data.items) ? data.items : []

  if (query) {
    items = items.filter((item) =>
      [item.title, item.genre, item.description, item.sourceUrl]
        .map(normalizeText)
        .some((value) => value.includes(query))
    )
  }

  const activeFilters = Object.entries(sourceFilters).filter(([, value]) => normalizeText(value).length > 0)
  if (activeFilters.length > 0) {
    items = items.filter((item) =>
      activeFilters.every(([key, value]) => {
        const candidate = normalizeText((item as unknown as Record<string, unknown>)[key])
        return candidate.includes(normalizeText(value))
      })
    )
  }

  const totalPages = Math.max(1, Math.ceil(items.length / DEFAULT_PAGE_SIZE))
  const currentPage = Math.min(safePage, totalPages)
  const start = (currentPage - 1) * DEFAULT_PAGE_SIZE

  return {
    ...data,
    items: items.slice(start, start + DEFAULT_PAGE_SIZE),
    page: currentPage,
    totalPages,
  }
}

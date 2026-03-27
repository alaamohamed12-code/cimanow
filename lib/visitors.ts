/**
 * In-memory visitor tracking store.
 * Uses globalThis to survive hot reloads in development.
 * For multi-instance production deployments, replace with Redis or a DB.
 */

interface Visitor {
  id: string
  lastSeen: number
  page: string
}

interface VisitorStore {
  sessions: Map<string, Visitor>
  peakToday: number
  history: Array<{ ts: number; count: number }>
  lastHistoryDay: string
  allTimeVisitorIds: Set<string>
  dailyVisitorIds: Map<string, Set<string>>
}

declare global {
  var _visitorStore: VisitorStore | undefined
}

function ensureStoreShape(store: Partial<VisitorStore>): VisitorStore {
  const safeStore = store as VisitorStore

  if (!(safeStore.sessions instanceof Map)) {
    safeStore.sessions = new Map()
  }
  if (typeof safeStore.peakToday !== 'number') {
    safeStore.peakToday = 0
  }
  if (!Array.isArray(safeStore.history)) {
    safeStore.history = []
  }
  if (typeof safeStore.lastHistoryDay !== 'string') {
    safeStore.lastHistoryDay = new Date().toDateString()
  }
  if (!(safeStore.allTimeVisitorIds instanceof Set)) {
    safeStore.allTimeVisitorIds = new Set()
  }
  if (!(safeStore.dailyVisitorIds instanceof Map)) {
    safeStore.dailyVisitorIds = new Map()
  }

  return safeStore
}

function getStore(): VisitorStore {
  if (!global._visitorStore) {
    global._visitorStore = ensureStoreShape({
      sessions: new Map(),
      peakToday: 0,
      history: [],
      lastHistoryDay: new Date().toDateString(),
      allTimeVisitorIds: new Set(),
      dailyVisitorIds: new Map(),
    })
  } else {
    global._visitorStore = ensureStoreShape(global._visitorStore)
  }
  return global._visitorStore
}

const TIMEOUT_MS = 60_000   // visitor inactive after 60 s
const MAX_HISTORY = 72      // ~6 minutes at 5-s intervals

function cleanup(store: VisitorStore) {
  const now = Date.now()
  for (const [id, v] of store.sessions) {
    if (now - v.lastSeen > TIMEOUT_MS) {
      store.sessions.delete(id)
    }
  }
}

function resetIfNewDay(store: VisitorStore) {
  const today = new Date().toDateString()
  if (today !== store.lastHistoryDay) {
    store.peakToday = 0
    store.history.length = 0
    store.lastHistoryDay = today
  }
}

function toDayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Register or refresh a visitor session. */
export function registerVisitor(id: string, page = '/') {
  const store = getStore()
  resetIfNewDay(store)
  const now = Date.now()
  const dayKey = toDayKey(now)

  store.sessions.set(id, { id, lastSeen: Date.now(), page })

  if (!store.allTimeVisitorIds.has(id)) {
    store.allTimeVisitorIds.add(id)
  }

  let todaySet = store.dailyVisitorIds.get(dayKey)
  if (!todaySet) {
    todaySet = new Set<string>()
    store.dailyVisitorIds.set(dayKey, todaySet)
  }
  todaySet.add(id)

  cleanup(store)
  const current = store.sessions.size
  if (current > store.peakToday) store.peakToday = current
}

/** Append a history data point (called by SSE sender every 5 s). */
export function recordHistoryPoint() {
  const store = getStore()
  resetIfNewDay(store)
  cleanup(store)
  store.history.push({ ts: Date.now(), count: store.sessions.size })
  if (store.history.length > MAX_HISTORY) store.history.shift()
}

/** Return a snapshot of current stats. */
export function getStats() {
  const store = getStore()
  cleanup(store)
  const todayKey = toDayKey(Date.now())
  const dailyVisits = [...store.dailyVisitorIds.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, ids]) => ({ date, visits: ids.size }))

  return {
    current: store.sessions.size,
    peakToday: store.peakToday,
    uniqueToday: store.dailyVisitorIds.get(todayKey)?.size ?? 0,
    totalVisitorsAllTime: store.allTimeVisitorIds.size,
    dailyVisits,
    history: [...store.history],
    lastUpdated: Date.now(),
  }
}

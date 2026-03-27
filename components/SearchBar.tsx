'use client'

import { useState, useCallback, useEffect, useRef, type Ref } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'

interface SearchSuggestion {
  id: string
  title: string
  image: string
  genre: string
  year: number
  sourceUrl?: string
}

interface SearchBarProps {
  onSearch?: (query: string) => void
  autoRedirect?: boolean
  compact?: boolean
  inputRef?: Ref<HTMLInputElement>
  onAfterNavigate?: () => void
  mobileMode?: boolean
  onClose?: () => void
}

export default function SearchBar({
  onSearch,
  autoRedirect: _autoRedirect = false,
  compact = false,
  inputRef,
  onAfterNavigate,
  mobileMode = false,
  onClose,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  void _autoRedirect

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      if (onSearch) {
        onSearch(value)
      }
    },
    [onSearch]
  )

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    let isCancelled = false
    const timeout = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&page=1`, {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!isCancelled) {
          setSuggestions(Array.isArray(data.items) ? data.items.slice(0, 6) : [])
          setIsOpen(true)
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => {
      isCancelled = true
      clearTimeout(timeout)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const goToSearchPage = useCallback(
    (value: string) => {
      if (!value.trim()) {
        return
      }
      setIsOpen(false)
      if (onAfterNavigate) onAfterNavigate()
      router.push(`/search?q=${encodeURIComponent(value.trim())}`)
    },
    [router, onAfterNavigate]
  )

  const handleSuggestionClick = useCallback(
    (item: SearchSuggestion) => {
      const href = toLocalContentPath(item.sourceUrl)
      setIsOpen(false)
      if (onAfterNavigate) onAfterNavigate()
      if (href) {
        router.push(href)
        return
      }
      goToSearchPage(item.title)
    },
    [goToSearchPage, router, onAfterNavigate]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      goToSearchPage(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div ref={containerRef} className="relative">
        <div
          className={`group relative flex items-center border border-white/15 bg-[#0d1426]/75 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-emerald-300/45 hover:shadow-[0_18px_45px_rgba(53,242,198,0.2)] ${compact ? 'rounded-xl p-1.5' : 'rounded-2xl p-2'} ${mobileMode ? 'mobile-searchbar' : ''}`}
        >
          {mobileMode && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-3.5-3.5" />
              </svg>
            </span>
          )}
          <input
            suppressHydrationWarning
            type="text"
            placeholder="ابحث عن الأفلام والمسلسلات والمنوعات..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true)
              }
            }}
            className={`w-full bg-transparent text-white placeholder-gray-400 outline-none ${compact ? 'px-3 py-2 pr-3 text-sm rounded-xl' : 'px-4 py-3 pr-10 text-base rounded-2xl'} ${mobileMode ? 'mobile-searchbar-input' : ''}`}
            ref={inputRef}
            style={mobileMode ? { direction: 'rtl' } : {}}
          />
          {mobileMode && onClose && (
            <button
              type="button"
              aria-label="إغلاق البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl px-1"
              onClick={onClose}
              tabIndex={0}
              style={{ zIndex: 2 }}
            >
              ×
            </button>
          )}
          {!compact && !mobileMode && (
            <button
              suppressHydrationWarning
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-300 to-indigo-300 px-4 py-2 text-sm font-bold text-[#08211b] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              بحث
            </button>
          )}
          {isLoading && (
            <div className={`absolute top-1/2 -translate-y-1/2 ${compact ? 'left-3' : 'left-20'}`}>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300/30 border-t-emerald-300" />
            </div>
          )}
        </div>

        {isOpen && query.trim().length >= 2 && (
          <div className={`absolute z-50 mt-2 w-full overflow-hidden border border-white/10 bg-[#09111f]/95 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${compact ? 'rounded-2xl' : 'rounded-3xl'}`}>
            {suggestions.length > 0 ? (
              <>
                <div className="max-h-[380px] overflow-y-auto p-2">
                  {suggestions.map((item) => (
                    <button
                      suppressHydrationWarning
                      key={item.id}
                      type="button"
                      onClick={() => handleSuggestionClick(item)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition hover:bg-white/8"
                    >
                      <div className="relative h-14 w-11 flex-none overflow-hidden rounded-xl border border-white/10 bg-[#050a16]">
                        <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized quality={100} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="hero-title-text line-clamp-1 text-sm">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-400">{item.genre} • {item.year}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => goToSearchPage(query)}
                  className="flex w-full items-center justify-between border-t border-white/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-white/6"
                >
                  <span>عرض كل النتائج</span>
                  <span className="text-white/70">{query}</span>
                </button>
              </>
            ) : !isLoading ? (
              <div className="px-4 py-4 text-sm text-gray-400">لا توجد اقتراحات مطابقة</div>
            ) : null}
          </div>
        )}
      </div>
    </form>
  )
}

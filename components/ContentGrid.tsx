'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Content } from '@/lib/mockData'
import ContentCard from './ContentCard'
import { useRouter } from 'next/navigation'
import { toLocalContentPath } from '@/lib/moviePath'

interface ContentGridProps {
  items: Content[]
  itemsPerPage?: number
}

export default function ContentGrid({
  items,
  itemsPerPage = 20,
}: ContentGridProps) {
  const router = useRouter()
  const [displayedItems, setDisplayedItems] = useState<Content[]>(
    items.slice(0, itemsPerPage)
  )
  const pageRef = useRef(0)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Initialize with first batch of items
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage))
    pageRef.current = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, itemsPerPage])

  // Load more items on scroll
  const loadMore = useCallback(() => {
    pageRef.current += 1
    const nextPage = pageRef.current
    const startIndex = nextPage * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    if (startIndex < items.length) {
      setDisplayedItems((prev) => [...prev, ...items.slice(startIndex, endIndex)])
    }
  }, [items, itemsPerPage])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedItems.length < items.length) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore, displayedItems.length, items.length])

  const handleCardClick = (item: Content) => {
    const href = toLocalContentPath(item.sourceUrl)
    if (href) {
      router.push(href)
    }
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid w-full [grid-template-columns:repeat(auto-fill,minmax(170px,1fr))] gap-4">
        {displayedItems.map((item, index) => (
          <ContentCard key={item.id} content={item} priority={index === 0} onClick={handleCardClick} />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {displayedItems.length < items.length && (
        <div ref={observerTarget} className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      )}

      {/* End Message */}
      {displayedItems.length >= items.length && items.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">تم تحميل جميع العناصر</p>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">لا توجد عناصر لعرضها</p>
        </div>
      )}
    </div>
  )
}

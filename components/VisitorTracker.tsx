'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getOrCreateSessionId(): string | null {
  try {
    let id = localStorage.getItem('_vsid')
    if (!id) {
      id =
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2)
      localStorage.setItem('_vsid', id)
    }
    return id
  } catch {
    return null
  }
}

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    const ping = () => {
      fetch('/api/visitors/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, page: pathname }),
        keepalive: true,
      }).catch(() => {})
    }

    ping()
    const id = setInterval(ping, 30_000)
    return () => clearInterval(id)
  }, [pathname])

  return null
}

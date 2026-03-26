import { type NextRequest } from 'next/server'
import { getStats, recordHistoryPoint } from '@/lib/visitors'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        recordHistoryPoint()
        const stats = getStats()
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(stats)}\n\n`),
          )
        } catch {
          // client already disconnected
        }
      }

      // Send immediately, then every 5 s
      send()
      const intervalId = setInterval(send, 5_000)

      req.signal.addEventListener('abort', () => {
        clearInterval(intervalId)
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

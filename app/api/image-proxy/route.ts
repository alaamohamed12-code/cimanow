import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

const ALLOWED_HOSTS = new Set(['img.downet.net', 'ak.sv'])

const SIZE_PROFILES = {
  thumbnail: { maxWidth: 300, maxHeight: 450 },
  card: { maxWidth: 400, maxHeight: 600 },
  hero: { maxWidth: 800, maxHeight: 1200 },
}

const QUALITY = 75

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url')
  const format = request.nextUrl.searchParams.get('format') || 'webp'
  const sizeProfile = (request.nextUrl.searchParams.get('size') || 'card') as keyof typeof SIZE_PROFILES

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL

  try {
    parsed = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 })
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'https://ak.sv/',
      },
      next: { revalidate: 86400 },
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream image fetch failed' }, { status: 502 })
    }

    const buffer = await upstream.arrayBuffer()

    // Optimize image with Sharp
    let optimized: Buffer
    try {
      const sharpImage = sharp(buffer)
      const metadata = await sharpImage.metadata()
      
      const profileConfig = SIZE_PROFILES[sizeProfile] || SIZE_PROFILES.card
      
      // Calculate dimensions maintaining aspect ratio
      const dimensions = {
        width: Math.min(metadata.width || profileConfig.maxWidth, profileConfig.maxWidth),
        height: metadata.height ? Math.floor((metadata.height * Math.min(metadata.width || profileConfig.maxWidth, profileConfig.maxWidth)) / (metadata.width || 1)) : profileConfig.maxHeight,
      }
      
      // Limit height
      if (dimensions.height > profileConfig.maxHeight) {
        dimensions.height = profileConfig.maxHeight
        dimensions.width = Math.floor((profileConfig.maxHeight * (metadata.width || 1)) / (metadata.height || 1))
      }

      // Convert and compress
      optimized = await sharpImage
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center',
        })
        .toFormat(format as 'webp' | 'jpeg' | 'png', {
          quality: QUALITY,
          progressive: format === 'jpeg',
        })
        .toBuffer()
    } catch (optimError) {
      console.warn('Sharp optimization failed, returning original:', optimError)
      optimized = Buffer.from(buffer)
    }

    // Convert Buffer to Uint8Array for compatibility with NextResponse
    const responseBody = new Uint8Array(optimized);

    const contentTypeMap: Record<string, string> = {
      webp: 'image/webp',
      jpeg: 'image/jpeg',
      png: 'image/png',
    }
    const contentType = contentTypeMap[format as string] || 'image/webp'

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'CDN-Cache-Control': 'max-age=604800',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Image proxy failed' }, { status: 500 })
  }
}

export const revalidate = 3600
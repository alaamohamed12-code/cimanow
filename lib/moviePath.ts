const toAbsoluteUrl = (value: string): string => {
  return value.startsWith('http') ? value : `https://ak.sv${value}`
}

export const toLocalContentPath = (sourceUrl?: string): string | null => {
  if (!sourceUrl) {
    return null
  }

  try {
    const absolute = toAbsoluteUrl(sourceUrl)
    const parsed = new URL(absolute)
    const allowed = ['/movie/', '/series/', '/episode/', '/shows/', '/show/episode/', '/mix/']
    if (!allowed.some((prefix) => parsed.pathname.startsWith(prefix))) {
      return null
    }

    return parsed.pathname
  } catch {
    return null
  }
}

export const toLocalMoviePath = (sourceUrl?: string): string | null => {
  const path = toLocalContentPath(sourceUrl)
  return path?.startsWith('/movie/') ? path : null
}

export const toLocalSeriesPath = (sourceUrl?: string): string | null => {
  const path = toLocalContentPath(sourceUrl)
  return path?.startsWith('/series/') ? path : null
}

export const toLocalEpisodePath = (sourceUrl?: string): string | null => {
  const path = toLocalContentPath(sourceUrl)
  return path?.startsWith('/episode/') || path?.startsWith('/show/episode/') ? path : null
}

export const toLocalShowsPath = (sourceUrl?: string): string | null => {
  const path = toLocalContentPath(sourceUrl)
  return path?.startsWith('/shows/') ? path : null
}

export const toLocalMixPath = (sourceUrl?: string): string | null => {
  const path = toLocalContentPath(sourceUrl)
  return path?.startsWith('/mix/') ? path : null
}

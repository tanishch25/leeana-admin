/**
 * Utility to resolve relative media paths from leeana-luxury-atelier (/assets/...)
 * to the production origin https://leeana.in when viewed inside the standalone dashboard.
 */
export const resolveMediaUrl = (url: string | undefined): string => {
  if (!url) return ''
  const trimmed = url.trim()
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `https://leeana.in${cleanPath}`
}

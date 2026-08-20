/**
 * Constructs asset URLs for static and media assets.
 * Phase 1: Serves static assets from Vercel CDN (/public/assets/<folder>/<filename>)
 * Phase 2: Single swap point to prefix Supabase Storage URL if needed.
 */
export function buildAssetUrl(folder: string, filename?: string | null): string {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
  const cleanFilename = filename.replace(/^\/+/, '')

  if (cleanFolder.startsWith('assets/')) {
    return `/${cleanFolder}/${cleanFilename}`
  }
  return `/assets/${cleanFolder}/${cleanFilename}`
}

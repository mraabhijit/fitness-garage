/**
 * Constructs asset URLs for static and media assets.
 * Supports root and subpath deployments (e.g. GitHub Pages /fitness-garage/).
 */
export function buildAssetUrl(folder: string, filename?: string | null): string {
  if (!filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
  const cleanFilename = filename.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '')

  if (cleanFolder.startsWith('assets/')) {
    return `${base}/${cleanFolder}/${cleanFilename}`
  }
  return `${base}/assets/${cleanFolder}/${cleanFilename}`
}

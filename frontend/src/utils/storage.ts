export function buildStorageUrl(filePath: string | null | undefined): string {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const cleanPath = filePath.replace(/^\/+/, '')
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${cleanPath}`
}

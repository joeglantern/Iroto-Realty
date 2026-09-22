const mediaUrl = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '')

// Uploaded files live on the server under {bucket}/{path}; the database stores only the path.
export function getStorageUrl(bucket: string, path: string): string {
  if (!path) return ''
  return `${mediaUrl}/${bucket}/${path}`
}

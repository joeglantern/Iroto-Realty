import path from 'node:path'

export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || './uploads')

// Absolute ceiling; the admin UI warns (but allows) anything over 40 MB.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024

export const BUCKETS: Record<string, { maxBytes: number }> = {
  'property-images': { maxBytes: MAX_UPLOAD_BYTES },
  'blog-images': { maxBytes: MAX_UPLOAD_BYTES },
  'review-images': { maxBytes: MAX_UPLOAD_BYTES },
  'profile-images': { maxBytes: MAX_UPLOAD_BYTES },
}

export const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jpe': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export const isKnownBucket = (bucket: string) => Object.hasOwn(BUCKETS, bucket)

// Resolve bucket + object path to an absolute file path, refusing anything that escapes the bucket.
export function resolveObjectPath(bucket: string, objectPath: string): string | null {
  if (!isKnownBucket(bucket) || !objectPath || objectPath.includes('\0')) return null
  const bucketDir = path.join(UPLOAD_ROOT, bucket)
  const fullPath = path.resolve(bucketDir, objectPath)
  if (!fullPath.startsWith(bucketDir + path.sep)) return null
  return fullPath
}

export { getStorageUrl } from './media'

async function readError(response: Response) {
  const body = await response.json().catch(() => null)
  return new Error(body?.error || `Request failed with status ${response.status}`)
}

// Upload a file to the server's media storage, with a 60 second timeout
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: Error | null }> {
  const form = new FormData()
  form.append('bucket', bucket)
  form.append('path', path)
  form.append('file', file)

  try {
    const response = await fetch('/api/storage', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60000),
    })
    if (!response.ok) return { data: null, error: await readError(response) }
    return { data: await response.json(), error: null }
  } catch (error: any) {
    if (error?.name === 'TimeoutError') {
      return { data: null, error: new Error(`File upload timed out after 60 seconds for ${file.name}`) }
    }
    return { data: null, error }
  }
}

// Delete a file from the server's media storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ data: { deleted: number } | null; error: Error | null }> {
  try {
    const response = await fetch('/api/storage', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, paths: [path] }),
    })
    if (!response.ok) return { data: null, error: await readError(response) }
    return { data: await response.json(), error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

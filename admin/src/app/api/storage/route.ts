import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/session'
import { BUCKETS, MIME_BY_EXTENSION, resolveObjectPath } from '@/lib/uploads'

// Uploads are only accepted from the admin's own pages, not from forms on other sites.
function isCrossSite(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== request.headers.get('host')
  } catch {
    return true
  }
}

export async function POST(request: NextRequest) {
  if (isCrossSite(request)) {
    return NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 })
  }
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const form = await request.formData()
  const bucket = String(form.get('bucket') ?? '')
  const objectPath = String(form.get('path') ?? '')
  const file = form.get('file')

  const target = resolveObjectPath(bucket, objectPath)
  if (!target || !(file instanceof File)) {
    return NextResponse.json({ error: 'Invalid bucket, path or file' }, { status: 400 })
  }
  if (file.size > BUCKETS[bucket].maxBytes) {
    return NextResponse.json({ error: 'File is too large (maximum 100 MB)' }, { status: 413 })
  }
  const allowedTypes = [...Object.values(MIME_BY_EXTENSION), 'image/jpg']
  if (!MIME_BY_EXTENSION[path.extname(target).toLowerCase()] || !allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG and WebP images are allowed' }, { status: 415 })
  }

  try {
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(await file.arrayBuffer()), { flag: 'wx' })
  } catch (error: any) {
    const message = error?.code === 'EEXIST' ? 'The resource already exists' : 'Failed to save file'
    return NextResponse.json({ error: message }, { status: error?.code === 'EEXIST' ? 409 : 500 })
  }

  return NextResponse.json({ path: objectPath })
}

export async function DELETE(request: NextRequest) {
  if (isCrossSite(request)) {
    return NextResponse.json({ error: 'Cross-site request refused' }, { status: 403 })
  }
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { bucket, paths } = await request.json()
  if (!Array.isArray(paths)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  for (const objectPath of paths) {
    const target = resolveObjectPath(String(bucket), String(objectPath))
    if (!target) {
      return NextResponse.json({ error: 'Invalid bucket or path' }, { status: 400 })
    }
    await unlink(target).catch(() => {})
  }

  return NextResponse.json({ deleted: paths.length })
}

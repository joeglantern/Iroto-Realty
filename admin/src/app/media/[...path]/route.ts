import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { MIME_BY_EXTENSION, resolveObjectPath } from '@/lib/uploads'

// In production Caddy serves /media straight from disk; this route covers local development.
export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const [bucket, ...rest] = params.path.map(decodeURIComponent)
  const target = resolveObjectPath(bucket, rest.join('/'))
  const contentType = target && MIME_BY_EXTENSION[path.extname(target).toLowerCase()]
  if (!target || !contentType) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const body = await readFile(target)
    return new NextResponse(new Uint8Array(body), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

// Download every file from every Supabase storage bucket into <outDir>/<bucket>/<path>.
// Safe to re-run: files already downloaded with the same size are skipped.
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node export-storage.mjs <outDir>
import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const outDir = process.argv[2]
if (!baseUrl || !key || !outDir) {
  console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node export-storage.mjs <outDir>')
  process.exit(1)
}

const headers = { apikey: key, Authorization: `Bearer ${key}` }

async function api(url, init = {}) {
  const response = await fetch(url, { ...init, headers: { ...headers, ...init.headers } })
  if (!response.ok) throw new Error(`${init.method || 'GET'} ${url} failed: ${response.status} ${await response.text()}`)
  return response
}

async function listFolder(bucket, prefix) {
  const entries = []
  for (let offset = 0; ; offset += 1000) {
    const response = await api(`${baseUrl}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    })
    const page = await response.json()
    entries.push(...page)
    if (page.length < 1000) return entries
  }
}

async function* walk(bucket, prefix = '') {
  for (const entry of await listFolder(bucket, prefix)) {
    const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.id === null) yield* walk(bucket, fullPath)
    else yield { path: fullPath, size: entry.metadata?.size }
  }
}

const buckets = await (await api(`${baseUrl}/storage/v1/bucket`)).json()
let downloaded = 0
let skipped = 0

for (const bucket of buckets) {
  for await (const object of walk(bucket.id)) {
    const target = path.join(outDir, bucket.id, ...object.path.split('/'))
    const existing = await stat(target).catch(() => null)
    if (existing && existing.size === object.size) {
      skipped++
      continue
    }
    const response = await api(`${baseUrl}/storage/v1/object/${bucket.id}/${object.path.split('/').map(encodeURIComponent).join('/')}`)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
    downloaded++
    if (downloaded % 25 === 0) console.log(`   ${downloaded} files downloaded...`)
  }
  console.log(`   bucket ${bucket.id} done`)
}

console.log(`Storage export complete: ${downloaded} downloaded, ${skipped} already present`)

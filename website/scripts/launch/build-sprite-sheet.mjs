// Stitch the Blender confetti frames into public/launch/confetti-sprites.webp.
// Layout: one row per (shape, material) pair, one column per tumble frame.
// Usage: node scripts/launch/build-sprite-sheet.mjs <frames_dir>
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const framesDir = process.argv[2]
if (!framesDir) {
  console.error('Usage: node scripts/launch/build-sprite-sheet.mjs <frames_dir>')
  process.exit(1)
}

const TILE = 96
const SHAPES = 3
const MATERIALS = 4
const FRAMES = 12

const files = new Set(await readdir(framesDir))
const composites = []
for (let shape = 0; shape < SHAPES; shape++) {
  for (let material = 0; material < MATERIALS; material++) {
    for (let frame = 0; frame < FRAMES; frame++) {
      const name = `s${shape}_m${material}_f${String(frame).padStart(2, '0')}.png`
      if (!files.has(name)) throw new Error(`Missing frame ${name}`)
      composites.push({
        input: path.join(framesDir, name),
        left: frame * TILE,
        top: (shape * MATERIALS + material) * TILE,
      })
    }
  }
}

const output = path.resolve('public/launch/confetti-sprites.webp')
const info = await sharp({
  create: { width: TILE * FRAMES, height: TILE * SHAPES * MATERIALS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(composites)
  .webp({ quality: 88, alphaQuality: 100, effort: 6 })
  .toFile(output)

console.log(`Wrote ${output} (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB)`)

import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('docs/spikes/icons/001-yellow-badge.svg')
const sizes = [16, 32, 48, 128]

for (const size of sizes) {
    await sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`)
    console.log(`icon-${size}.png`)
}

/**
 * Scans every extracted file for framerusercontent asset references (images,
 * video, fonts) and downloads them into assets/, with a manifest recording each
 * file's source URL and where it is referenced.
 *
 * Run from the repo root:  node _tools/_fetch-assets.mjs
 */

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ASSETS = path.join(ROOT, "assets")

// images/ and assets/ are separate namespaces on framerusercontent.
const ASSET_RE =
    /https:\/\/framerusercontent\.com\/(?:images|assets)\/[A-Za-z0-9._-]+(?:\.[A-Za-z0-9]+)?/g

async function* walkDir(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            if (entry.name === "assets" || entry.name === "node_modules") continue
            yield* walkDir(full)
        } else {
            yield full
        }
    }
}

const refs = new Map()
const textExt = new Set([".js", ".mjs", ".tsx", ".ts", ".xml", ".json", ".md", ".html", ".txt"])

for await (const file of walkDir(ROOT)) {
    if (!textExt.has(path.extname(file))) continue
    const src = await readFile(file, "utf8")
    for (const m of src.matchAll(ASSET_RE)) {
        if (!refs.has(m[0])) refs.set(m[0], new Set())
        refs.get(m[0]).add(file)
    }
}

console.log(`found ${refs.size} distinct asset URLs`)

await mkdir(ASSETS, { recursive: true })
const manifest = {}
let ok = 0
const failed = []

for (const url of refs.keys()) {
    let name = url.split("/").pop()
    if (!path.extname(name)) name += ".bin"
    const dest = path.join(ASSETS, name)

    try {
        await stat(dest)
        manifest[url] = { file: `assets/${name}`, cached: true }
        ok++
        continue
    } catch {}

    try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        await writeFile(dest, buf)
        manifest[url] = {
            file: `assets/${name}`,
            bytes: buf.length,
            type: res.headers.get("content-type"),
            usedIn: [...refs.get(url)].map((f) => path.relative(ROOT, f)),
        }
        ok++
    } catch (err) {
        failed.push({ url, err: String(err) })
        console.log(`  FAILED ${name}: ${err}`)
    }
}

await writeFile(path.join(ASSETS, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8")
console.log(`downloaded ${ok}/${refs.size}, failed ${failed.length}`)

/**
 * Pulls the IntelliLink Framer components down as React source.
 *
 * Each component's public "insert URL" (https://framer.com/m/Name-hash.js) is a
 * thin re-export shim pointing at the compiled module on framerusercontent.com.
 * This walks from those shims through the whole dependency graph, saves every
 * module, and rewrites the absolute framerusercontent imports to local relative
 * paths so the result builds offline.
 *
 * Run from the repo root:  node _tools/_fetch-modules.mjs
 */

import { writeFile, mkdir, readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

// fileURLToPath, not url.pathname — the latter leaves %20 encoded in the path.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const MOD_DIR = path.join(ROOT, "framer", "modules")

const INSERT_URLS = JSON.parse(
    (await readFile(path.join(ROOT, "_framer-xml", "insert-urls.json"), "utf8")).replace(/^﻿/, "")
)

const UA = { "User-Agent": "Mozilla/5.0", Accept: "*/*" }
const MODULE_RE = /https:\/\/framerusercontent\.com\/modules\/[A-Za-z0-9/_-]+\.(?:js|mjs)/g

const seen = new Map()
const failed = []

const basenameFor = (url) => {
    const last = url.split("/").pop()
    return last.endsWith(".js") || last.endsWith(".mjs") ? last : `${last}.js`
}

async function get(url, tries = 3) {
    for (let i = 1; i <= tries; i++) {
        try {
            const res = await fetch(url, { headers: UA })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return await res.text()
        } catch (err) {
            if (i === tries) throw err
            await new Promise((r) => setTimeout(r, 400 * i))
        }
    }
}

/** Follows a shim that only re-exports a single upstream module. */
async function resolveShim(url) {
    const src = await get(url)
    const hits = [...src.matchAll(MODULE_RE)].map((m) => m[0])
    const isShim = /export\s*\*\s*from/.test(src) && src.length < 2000 && hits.length
    return isShim ? hits[0] : null
}

async function walk(url, depth = 0) {
    if (seen.has(url)) return seen.get(url)
    const name = basenameFor(url)
    seen.set(url, name)

    let src
    try {
        src = await get(url)
    } catch (err) {
        failed.push({ url, err: String(err) })
        seen.delete(url)
        return null
    }

    const deps = [...new Set([...src.matchAll(MODULE_RE)].map((m) => m[0]))]
    for (const dep of deps) {
        if (dep !== url) await walk(dep, depth + 1)
    }

    let rewritten = src
    for (const dep of deps) {
        if (dep === url) continue
        const localName = seen.get(dep)
        if (localName) rewritten = rewritten.split(dep).join(`./${localName}`)
    }

    await writeFile(path.join(MOD_DIR, name), rewritten, "utf8")
    process.stdout.write(`${"  ".repeat(Math.min(depth, 3))}${name}  (${src.length} chars, ${deps.length} deps)\n`)
    return name
}

await mkdir(MOD_DIR, { recursive: true })

const index = {}
for (const [component, shimUrl] of Object.entries(INSERT_URLS)) {
    process.stdout.write(`\n== ${component} ==\n`)
    try {
        const real = await resolveShim(shimUrl)
        const target = real ?? shimUrl
        const name = await walk(target)
        if (name) index[component] = { shimUrl, moduleUrl: target, file: `framer/modules/${name}` }
    } catch (err) {
        failed.push({ component, err: String(err) })
        process.stdout.write(`  FAILED: ${err}\n`)
    }
}

// Named re-export barrels, so imports read `./framer/Button.js` not a hash.
for (const [component, info] of Object.entries(index)) {
    const rel = `./modules/${path.basename(info.file)}`
    await writeFile(
        path.join(ROOT, "framer", `${component}.js`),
        `// ${component} — re-exported from the compiled Framer module.\n` +
            `export * from "${rel}"\nexport { default } from "${rel}"\n`,
        "utf8"
    )
}

await writeFile(path.join(ROOT, "framer", "index.json"), JSON.stringify(index, null, 2), "utf8")

process.stdout.write(
    `\n\nDONE. components: ${Object.keys(index).length}  modules: ${seen.size}  failed: ${failed.length}\n`
)
if (failed.length) process.stdout.write(JSON.stringify(failed, null, 2) + "\n")

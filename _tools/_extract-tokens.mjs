/**
 * Extracts the project's colour and text styles from the Framer XML into
 * tokens.json and tokens.css. Pure data extraction, no components are built.
 *
 * Run from the repo root:  node _tools/_extract-tokens.mjs
 */

import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BOM = "﻿"
const xml = (
    await readFile(path.join(ROOT, "_framer-xml", "PROJECT-styles-and-tree.xml"), "utf8")
).replace(new RegExp("^" + BOM), "")

const attrs = (block) => {
    const out = {}
    for (const m of block.matchAll(/(\w+)="([^"]*)"/g)) out[m[1]] = m[2]
    return out
}

/** "/Brand/Primary dark" -> "brand-primary-dark" */
const slug = (p) =>
    p
        .replace(/^\//, "")
        .replace(/%/g, "pct")
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()

const colors = []
for (const m of xml.matchAll(/<ColorStyle\b([\s\S]*?)\/>/g)) {
    const a = attrs(m[1])
    if (a.path)
        colors.push({ path: a.path, name: slug(a.path), light: a.light, dark: a.dark || null })
}

const texts = []
for (const m of xml.matchAll(/<TextStyle\b([\s\S]*?)\/>/g)) {
    const a = attrs(m[1])
    if (a.path) texts.push({ path: a.path, name: slug(a.path), ...a })
}

await writeFile(
    path.join(ROOT, "tokens.json"),
    JSON.stringify(
        {
            source: "Framer project 1c228b2ad6036e6b",
            extracted: new Date().toISOString().slice(0, 10),
            colors,
            textStyles: texts,
        },
        null,
        2
    ),
    "utf8"
)

// Framer font selectors look like "CUSTOMV2;PP Neue Montreal Medium" or "GF;Geist-500".
const cssFamily = (sel = "") => {
    const name = sel.split(";").pop() ?? ""
    const base = name.replace(/-(regular|\d{3})$/i, "")
    return `"${base}", system-ui, sans-serif`
}
const cssWeight = (sel = "") => {
    const m = sel.match(/-(\d{3})$/)
    if (m) return m[1]
    if (/medium/i.test(sel)) return "500"
    if (/bold/i.test(sel)) return "700"
    return "400"
}

const lines = [
    "/* IntelliLink design tokens, extracted from the Framer project. */",
    "/* Every colour style has an empty dark value in Framer, so no dark theme is defined. */",
    "",
    ":root {",
    ...colors.map((c) => `  --color-${c.name}: ${c.light};`),
    "",
    ...texts.flatMap((t) => [
        `  /* ${t.path} (${t.tag}) */`,
        `  --text-${t.name}-family: ${cssFamily(t.font)};`,
        `  --text-${t.name}-weight: ${cssWeight(t.font)};`,
        `  --text-${t.name}-size: ${t.fontSize};`,
        `  --text-${t.name}-line-height: ${t.lineHeight};`,
        `  --text-${t.name}-letter-spacing: ${t.letterSpacing};`,
    ]),
    "}",
    "",
    ...texts.map(
        (t) =>
            `.text-${t.name} {\n` +
            `  font-family: var(--text-${t.name}-family);\n` +
            `  font-weight: var(--text-${t.name}-weight);\n` +
            `  font-size: var(--text-${t.name}-size);\n` +
            `  line-height: var(--text-${t.name}-line-height);\n` +
            `  letter-spacing: var(--text-${t.name}-letter-spacing);\n` +
            `  text-align: ${t.alignment};\n}`
    ),
    "",
]
await writeFile(path.join(ROOT, "tokens.css"), lines.join("\n"), "utf8")

console.log(`colours: ${colors.length}   text styles: ${texts.length}`)

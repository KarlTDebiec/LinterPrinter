const fs = require('fs')
const { normalizeFilePath } = require('../functions')

function parseRuff (infile) {
  console.log(`parseRuff() called with infile: ${infile}`)

  if (!fs.existsSync(infile)) {
    console.log(`File not found: ${infile}`)
    return []
  }

  const fileContent = fs.readFileSync(infile, 'utf8')
  const normalizedContent = fileContent.replace(/^\uFEFF/, '')

  if (!normalizedContent) {
    console.log(`Empty file: ${infile}`)
    return []
  }

  const annotations = []
  let jsonPayload = null
  try {
    jsonPayload = JSON.parse(normalizedContent)
  } catch (error) {
    console.log(`Failed to parse JSON ruff output: ${error}`)
    return []
  }

  if (!Array.isArray(jsonPayload)) {
    console.log('Unexpected ruff output format; expected JSON array')
    return []
  }

  for (const entry of jsonPayload) {
    if (!entry || !entry.filename || !entry.location) {
      continue
    }

    annotations.push({
      source: 'ruff',
      level: 'warning',
      filePath: normalizeFilePath(entry.filename),
      line: entry.location.row,
      kind: entry.code || 'ruff',
      message: (entry.message || '').trim(),
    })
  }

  console.log(`Parsed ${annotations.length} ruff annotations`)
  return annotations
}

module.exports = { parseRuff }

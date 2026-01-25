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
  const trimmed = normalizedContent.trimStart()
  let jsonPayload = null
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      jsonPayload = JSON.parse(normalizedContent)
    } catch (error) {
      console.log(`Failed to parse JSON ruff output: ${error}`)
    }
  }

  if (Array.isArray(jsonPayload)) {
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
  } else {
    const lines = normalizedContent.split('\n').filter(line => {
      const lineTrimmed = line.trim()

      return (
        lineTrimmed !== '' &&
        !lineTrimmed.startsWith('|') &&
        !/^\d+\s+\|/.test(lineTrimmed) &&
        !lineTrimmed.startsWith('= help:') // Skip ruff help lines
      )
    })

    for (const line of lines) {
      const match = line.match(
        /^(?<filePath>[^:]+):(?<line>\d+):(?<column>\d+): (?<code>\S+) (?<message>.+)$/)

      if (!match || !match.groups) {
        console.log(`Could not parse line: ${line}`)
        continue
      }

      const { filePath, line: lineNumber, code, message } = match.groups

      annotations.push({
        source: 'ruff',
        level: 'warning',
        filePath: normalizeFilePath(filePath),
        line: parseInt(lineNumber, 10),
        kind: code,
        message: message.trim(),
      })
    }
  }

  console.log(`Parsed ${annotations.length} ruff annotations`)
  return annotations
}

module.exports = { parseRuff }

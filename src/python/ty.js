const fs = require('fs')
const { normalizeFilePath } = require('../functions')

function mapSeverity (severity) {
  if (!severity) {
    return 'warning'
  }
  const normalized = severity.toLowerCase()
  if (normalized === 'info' || normalized === 'information' || normalized === 'note') {
    return 'notice'
  }
  return 'warning'
}

function parseTy (infile) {
  console.log(`parseTy() called with infile: ${infile}`)

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

  let jsonPayload = null
  try {
    jsonPayload = JSON.parse(normalizedContent)
  } catch (error) {
    console.log(`Failed to parse JSON ty output: ${error}`)
    return []
  }

  if (!Array.isArray(jsonPayload)) {
    console.log('Unexpected ty output format; expected JSON array')
    return []
  }

  const annotations = []

  for (const entry of jsonPayload) {
    const location = entry?.location
    const begin = location?.positions?.begin
    if (!location?.path || !begin?.line) {
      continue
    }

    annotations.push({
      source: 'ty',
      level: mapSeverity(entry.severity),
      filePath: normalizeFilePath(location.path),
      line: begin.line,
      kind: entry.check_name || 'ty',
      message: (entry.description || '').trim(),
    })
  }

  console.log(`Parsed ${annotations.length} ty annotations`)
  return annotations
}

module.exports = { parseTy }

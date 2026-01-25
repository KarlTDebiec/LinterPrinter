const fs = require('fs')
const { normalizeFilePath } = require('../functions')

function parsePyright (infile) {
  console.log(`parsePyright() called with infile: ${infile}`)

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
    console.log(`Failed to parse JSON pyright output: ${error}`)
    return []
  }

  if (!Array.isArray(jsonPayload?.generalDiagnostics)) {
    console.log('Unexpected pyright output format; expected generalDiagnostics array')
    return []
  }

  for (const diagnostic of jsonPayload.generalDiagnostics) {
    if (!diagnostic || !diagnostic.file || !diagnostic.range) {
      continue
    }

    const level = diagnostic.severity === 'error'
      ? 'error'
      : diagnostic.severity === 'information'
        ? 'notice'
        : 'warning'

    annotations.push({
      source: 'pyright',
      level,
      filePath: normalizeFilePath(diagnostic.file),
      line: (diagnostic.range.start?.line ?? 0) + 1,
      kind: diagnostic.rule || 'pyright',
      message: (diagnostic.message || '').trim(),
    })
  }

  console.log(`Parsed ${annotations.length} pyright annotations`)
  return annotations
}

module.exports = { parsePyright }

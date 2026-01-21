const fs = require('fs')
const { normalizeFilePath } = require('../functions')

const pyrightRegex = /^(?<filePath>.+):(?<line>\d+):(?<column>\d+) - (?<level>\w+): (?<message>.+?) \((?<kind>.+?)\)$/

function parsePyright (infile) {
  console.log(`parsePyright() called with infile: ${infile}`)

  if (!fs.existsSync(infile)) {
    console.log(`File not found: ${infile}`)
    return []
  }

  const fileContent = fs.readFileSync(infile, 'utf8')

  if (!fileContent) {
    console.log(`Empty file: ${infile}`)
    return []
  }

  const annotations = []
  const trimmed = fileContent.trimStart()
  let jsonPayload = null
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      jsonPayload = JSON.parse(fileContent)
    } catch (error) {
      console.log(`Failed to parse JSON pyright output: ${error}`)
    }
  }

  if (jsonPayload && Array.isArray(jsonPayload.generalDiagnostics)) {
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
  } else {
    const lines = fileContent.split('\n').
      map(line => line.trim()).
      filter(line => pyrightRegex.test(line)) // only main lines

    for (const line of lines) {
      const match = line.match(pyrightRegex)

      if (!match || !match.groups) {
        console.log(`Could not parse line: ${line}`)
        continue
      }

      const {
        filePath,
        line: lineNumber,
        message,
        kind,
      } = match.groups

      annotations.push({
        source: 'pyright',
        level: 'warning',
        filePath: normalizeFilePath(filePath),
        line: parseInt(lineNumber, 10),
        kind: kind.trim(),
        message: message.trim(),
      })
    }
  }

  console.log(`Parsed ${annotations.length} pyright annotations`)
  return annotations
}

module.exports = { parsePyright }

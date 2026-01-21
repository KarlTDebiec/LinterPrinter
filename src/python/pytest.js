const fs = require('fs')

const { normalizeFilePath } = require('../functions')

const headerRegexes = {
  start: /^=+ test session starts =+$/gm,
  errors: /^=+ ERRORS =+$/gm,
  failures: /^=+ FAILURES =+$/gm,
  warnings: /^=+ warnings summary =+$/gm,
  coverage: /^-+ coverage.* -+$/gm,
  summary: /^=+ short test summary info =+$/gm,
}

const errorHeaderRegex = /^_+ ERROR collecting (?<filePath>.+?) _+$/gm
const errorLineRegex = /^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$/gm
const failureRegex = /^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$\n^\s*$\n^(?<filePath>([A-Z]:)?[^:]+):(?<line>\d+):\s+(?<kind2>[^:\n]+$)/gm
const warningRegex = /^\s*(?<filePath>([A-Z]:)?[^:]+):(?<line>\d+):(?<kind>[^:]+):(?<message>[^\n]+)\n(?<code>[^\n]+)/gm
const tracebackLineRegex = /^\s*(?<filePath>[^\s:]+):(?<line>\d+):\s+in\s+/gm

function parseErrorsSection (body) {
  const annotations = []
  const headers = [...body.matchAll(errorHeaderRegex)]

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    const nextHeader = headers[i + 1]
    const rawFilePath = header.groups.filePath.trim()
    const blockStart = header.index + header[0].length
    const blockEnd = nextHeader ? nextHeader.index : body.length
    const block = body.slice(blockStart, blockEnd)
    const normalizedHeaderPath = normalizeFilePath(rawFilePath)

    let kind = 'CollectionError'
    let message = 'Pytest collection error'
    for (const errorMatch of block.matchAll(errorLineRegex)) {
      kind = errorMatch.groups.kind.trim()
      message = errorMatch.groups.message.trim()
    }

    let annotationLine = 1
    for (const traceMatch of block.matchAll(tracebackLineRegex)) {
      const traceFilePath = normalizeFilePath(traceMatch.groups.filePath.trim())
      const traceLine = parseInt(traceMatch.groups.line, 10)

      if (traceFilePath.endsWith(normalizedHeaderPath) ||
        normalizedHeaderPath.endsWith(traceFilePath)) {
        annotationLine = traceLine
        break
      }
    }

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath: normalizedHeaderPath,
      line: annotationLine,
      kind,
      message,
    })
  }

  return annotations
}

function parseFailuresSection (body) {
  const annotations = []

  for (const match of body.matchAll(failureRegex)) {
    const { filePath, line, kind, message } = match.groups

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath: normalizeFilePath(filePath),
      line: parseInt(line),
      kind: kind.trim(),
      message: message.trim(),
    })
  }

  return annotations
}

function parseWarningsSection (body) {
  const annotations = []

  for (const match of body.matchAll(warningRegex)) {
    const { filePath, line, kind, message } = match.groups

    if (!filePath.startsWith('.venv/')) {
      annotations.push({
        source: 'pytest',
        level: 'warning',
        filePath: normalizeFilePath(filePath),
        line: parseInt(line),
        kind: kind.trim(),
        message: message.trim(),
      })
    }
  }

  return annotations
}

function parsePytest (infile) {
  const annotations = []
  const fileContent = fs.readFileSync(infile, 'utf8')

  const headers = []
  for (const [section, regex] of Object.entries(headerRegexes)) {
    regex.lastIndex = 0
    const match = regex.exec(fileContent)
    if (match) {
      const start = match.index
      const end = start + match[0].length
      headers.push({ name: section, start, end })
    }
  }

  const bodies = {}
  for (let i = 1; i < headers.length; i++) {
    bodies[headers[i - 1].name] = {
      name: headers[i - 1].name,
      start: headers[i - 1].end,
      end: headers[i].start,
    }
  }
  if (headers.length > 0) {
    bodies[headers[headers.length - 1].name] = {
      name: headers[headers.length - 1].name,
      start: headers[headers.length - 1].end,
      end: fileContent.length,
    }
  }

  if (bodies.errors) {
    annotations.push(...parseErrorsSection(
      fileContent.slice(bodies.errors.start, bodies.errors.end)))
  }
  if (bodies.failures) {
    annotations.push(...parseFailuresSection(
      fileContent.slice(bodies.failures.start, bodies.failures.end)))
  }
  if (bodies.warnings) {
    annotations.push(...parseWarningsSection(
      fileContent.slice(bodies.warnings.start, bodies.warnings.end)))
  }

  return annotations
}

module.exports = { parsePytest }

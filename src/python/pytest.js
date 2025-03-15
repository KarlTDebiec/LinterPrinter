const fs = require('fs')

const headerRegexes = {
  start: /^=+ test session starts =+$/gm,
  errors: /^=+ ERRORS =+$/gm,
  failures: /^=+ FAILURES =+$/gm,
  warnings: /^=+ warnings summary =+$/gm,
  coverage: /^-+ coverage.* -+$/gm,
  summary: /^=+ short test summary info =+$/gm,
}

const errorRegex = /^_+ ERROR collecting (?<filePath>.*) _+$\n(^[^E_]+.*$\n)+^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$/gm
const failureRegex = /^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$\n^\s*$\n^(?<filePath>([A-Z]:)?[^:]+):(?<line>\d+):\s+(?<kind2>[^:\n]+$)/gm
const warningRegex = /^\s*(?<filePath>([A-Z]:)?[^:]+):(?<line>\d+):(?<kind>[^:]+):(?<message>[^\n]+)\n(?<code>[^\n]+)/gm
const tracebackLineRegex = /^\s*(?<filePath>[^\s:]+):(?<line>\d+):\s+in\s+/gm

function parseErrorsSection (body) {
  const annotations = []

  for (const match of body.matchAll(errorRegex)) {
    const { filePath, kind, message } = match.groups

    // Fallback line number
    let annotationLine = 1

    // Now search for the line number in the traceback
    const tracebackMatches = [...body.matchAll(tracebackLineRegex)]

    for (const traceMatch of tracebackMatches) {
      const traceFilePath = traceMatch.groups.filePath.trim()
      const traceLine = parseInt(traceMatch.groups.line, 10)

      // Debug: print everything it finds
      console.log(`TRACE: ${traceFilePath}:${traceLine}`)

      // Is this the file we're annotating?
      // We just need to match enough of the path
      if (traceFilePath.endsWith(filePath) ||
        filePath.endsWith(traceFilePath)) {
        annotationLine = traceLine
        console.log(
          `MATCHED FILE: ${traceFilePath}, using line ${annotationLine}`)
        break // Use the first matching trace line
      }
    }

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath, // You can normalize here if needed
      line: annotationLine,
      kind: kind.trim(),
      message: message.trim(),
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
      filePath,
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
        filePath,
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

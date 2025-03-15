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
const tracebackLineRegex = /^(?<filePath>.*):(?<line>\d+):\s+in\s+/gm

const path = require('path')

function normalizeFilePath (filePath) {
  const githubWorkspace = process.env.GITHUB_WORKSPACE || ''
  const absoluteFilePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(githubWorkspace, filePath)

  let relativeFilePath = path.relative(githubWorkspace, absoluteFilePath)
  relativeFilePath = relativeFilePath.split(path.sep).join('/')

  return relativeFilePath
}

function parseErrorsSection (body) {
  const annotations = []

  for (const match of body.matchAll(errorRegex)) {
    const { filePath, kind, message } = match.groups

    let annotationFilePath = normalizeFilePath(filePath)
    let annotationLine = 1

    // Look for the deepest file/line in the traceback
    const tracebackMatches = [...body.matchAll(tracebackLineRegex)]

    for (const traceMatch of tracebackMatches.reverse()) {
      const traceFilePath = traceMatch.groups.filePath
      const traceLine = parseInt(traceMatch.groups.line, 10)

      // Skip site-packages and virtualenv files
      if (
        !traceFilePath.includes('site-packages') &&
        !traceFilePath.includes('.venv')
      ) {
        annotationFilePath = normalizeFilePath(traceFilePath)
        annotationLine = traceLine
        break // Take the first valid one found (deepest)
      }
    }

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath: annotationFilePath,
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

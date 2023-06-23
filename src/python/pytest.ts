import * as fs from 'fs'
import { Annotation } from '../annotation'

interface Section {
  name: string
  start: number
  end: number
}

const headerRegexes = {
  start: /^=+ test session starts =+$/gm,
  errors: /^=+ ERRORS =+$/gm,
  failures: /^=+ FAILURES =+$/gm,
  warnings: /^=+ warnings summary =+$/gm,
  coverage: /^-+ coverage.* -+$/gm,
  summary: /^=+ short test summary info =+$/gm
}

const errorRegex =
  /^_+ ERROR collecting (?<filePath>.*) _+$\n(^[^E_]+.*$\n)+^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$/gm

const failureRegex =
  /^E\s+(?<kind>[^:\n]+):\s+(?<message>[^\n]+)$\n^\s*$\n^(?<filePath>([A-Z]:)?[^:]+):(?<line>\d+):\s+(?<kind2>[^:\n]+$)/gm

const warningRegex =
  /^\s*(?<file_path>([A-Z]:)?[^:]+):(?<line>\d+):(?<kind>[^:]+):(?<message>[^\n]+)\n(?<code>[^\n]+)/gm

function parseErrorsSection (body: string): Annotation[] {
  const annotations: Annotation[] = []

  for (const match of body.matchAll(errorRegex)) {
    const { filePath, kind, message } = match.groups as {
      filePath: string
      kind: string
      message: string
    }

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath,
      line: null,
      kind: kind.trim(),
      message: message.trim()
    })
  }

  return annotations
}

function parseFailuresSection (body: string): Annotation[] {
  const annotations: Annotation[] = []

  for (const match of body.matchAll(failureRegex)) {
    const { filePath, line, kind, message } = match.groups as {
      filePath: string
      line: string
      kind: string
      message: string
    }

    annotations.push({
      source: 'pytest',
      level: 'error',
      filePath,
      line: parseInt(line),
      kind: kind.trim(),
      message: message.trim()
    })
  }

  return annotations
}

function parseWarningsSection (body: string): Annotation[] {
  const annotations: Annotation[] = []

  for (const match of body.matchAll(warningRegex)) {
    const { filePath, line, kind, message } = match.groups as {
      filePath: string
      line: string
      kind: string
      message: string
    }

    if (!filePath.startsWith('.venv/')) {
      annotations.push({
        source: 'pytest',
        level: 'warning',
        filePath,
        line: parseInt(line),
        kind: kind.trim(),
        message: message.trim()
      })
    }
  }

  return annotations
}

export function parsePytest (infile: string): Annotation[] {
  const annotations: Annotation[] = []
  const fileContent: string = fs.readFileSync(infile, 'utf8')

  // Determine which section headers are present
  const headers: Section[] = []
  for (const [section, regex] of Object.entries(headerRegexes)) {
    const match = fileContent.match(regex)
    if (match) {
      const start = match.index?.valueOf() ?? 0
      const end = start ? start + match[0].length : 0
      headers.push({
        name: section,
        start,
        end
      })
    }
  }

  // Determine section body locations
  const bodies: {[key: string]: Section} = {}
  for (let i = 1; i < headers.length; i++) {
    bodies[headers[i - 1].name] = {
      name: headers[i - 1].name,
      start: headers[i - 1].end,
      end: headers[i].start
    }
  }
  bodies[headers[headers.length - 1].name] = {
    name: headers[headers.length - 1].name,
    start: headers[headers.length - 1].end,
    end: fileContent.length
  }

  // Parse sections
  if ('errors' in bodies) {
    const location = bodies.errors
    annotations.push(
      ...parseErrorsSection(fileContent.slice(location.start, location.end))
    )
  }
  if ('failures' in bodies) {
    const location = bodies.failures
    annotations.push(
      ...parseFailuresSection(fileContent.slice(location.start, location.end))
    )
  }
  if ('warnings' in bodies) {
    const location = bodies.warnings
    annotations.push(
      ...parseWarningsSection(fileContent.slice(location.start, location.end))
    )
  }

  return annotations
}

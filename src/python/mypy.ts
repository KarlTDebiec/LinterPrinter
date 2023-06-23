import * as fs from 'fs'
import { Annotation } from '../annotation'

const annotationRegex =
  /^\s*(?:(?:(?<filePath>[A-Z]:)?[^:]+):(?<line>\d+):(?<kind>[^:]+):\s*(?<message>[^\n]+))/

export function parseMypy (infile: string): Annotation[] {
  const annotations: Annotation[] = []
  const fileContent = fs.readFileSync(infile, 'utf8')

  let lastErrorIndex: number | null = null
  for (const match of fileContent.matchAll(annotationRegex)) {
    const { filePath, line, kind, message } = match.groups as {
      filePath: string
      line: string
      kind: string
      message: string
    }

    if (kind === 'error') {
      annotations.push({
        source: 'mypy',
        level: 'warning',
        filePath,
        line: parseInt(line),
        kind,
        message
      })
      lastErrorIndex = annotations.length - 1
    } else if (kind === 'note') {
      if (lastErrorIndex !== null) {
        const lastError = annotations[lastErrorIndex]
        if (
          lastError.filePath === filePath &&
          lastError.line === parseInt(line)
        ) {
          lastError.message += `\n${message}`
        }
      }
    }
  }

  return annotations
}

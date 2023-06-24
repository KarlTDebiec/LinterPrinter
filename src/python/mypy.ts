import * as fs from 'fs'
import { Annotation } from '../annotation'

const annotationRegex =
  /^\s*(?<filePath>[^:]+):(?<line>\d+):\s(?<lineType>[^:]+):\s(?<message>(?:(?!\s\s\[).)*)(\s\s\[(?<kind>[^\]]*)\])?$/gm

export function parseMypy (infile: string): Annotation[] {
  const annotations: Annotation[] = []
  const fileContent = fs.readFileSync(infile, 'utf8')

  let lastErrorIndex: number | null = null
  for (const match of fileContent.matchAll(annotationRegex)) {
    const { filePath, line, lineType, message, kind } = match.groups as {
      filePath: string;
      line: string;
      lineType: string;
      message: string;
      kind: string | null;
    }

    if (lineType === 'error') {
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

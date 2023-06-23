import * as fs from 'fs'
import { Annotation } from '../annotation'

export function parsePydocstyle (infile: string): Annotation[] {
  const annotations: Annotation[] = []
  const fileContent = fs.readFileSync(infile, 'utf8')
  const lines = fileContent.split('\n')

  for (let i = 0; i < lines.length; i += 2) {
    const line = lines[i]
    const issue = lines[i + 1]

    const filePath = line.split(' ')[0].split(':')[0]
    const lineNumber = parseInt(line.split(' ')[0].split(':')[1])
    const [kind, message] = issue.trim().split(': ')

    annotations.push({
      source: 'pydocstyle',
      level: 'warning',
      filePath,
      line: lineNumber,
      kind,
      message
    })
  }

  return annotations
}

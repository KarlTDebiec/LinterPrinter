import * as fs from 'fs'
import { Annotation } from '../annotation'

export function parseProspectorJSON (infile: string): Annotation[] {
  const annotations: Annotation[] = []
  const report = JSON.parse(fs.readFileSync(infile, 'utf8'))

  for (const match of report.messages) {
    annotations.push({
      source: 'prospector',
      level: 'warning',
      file_path: match.location.path,
      line: parseInt(match.location.line),
      kind: `${match.source}:${match.code}`,
      message: match.message
    })
  }

  return annotations
}

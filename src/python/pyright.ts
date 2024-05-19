import * as fs from 'fs'
import { Annotation } from '../annotation'
import { formatAnnotation } from '../functions'

const annotationRegex = /^\s+(?<filePath>\/[^:]+)?:?(?<line>\d+)?:?(?<character>\d+)?( - error: )?(?<message>.+)$/gm

export function parsePyright (infile: string): Annotation[] {
  console.log(`Parsing Pyright output from ${infile}`)

  const annotations: Annotation[] = []
  const fileContent = fs.readFileSync(infile, 'utf8')

  let lastErrorIndex: number | null = null
  for (const match of fileContent.matchAll(annotationRegex)) {
    const { filePath, line, character, message } = match.groups as {
      filePath: string | null;
      line: string | null;
      character: string | null;
      message: string;
    }
    console.log(filePath, line, character, message)

    if (filePath !== null && line !== null && message !== null) {
      annotations.push({
        source: 'pyright',
        level: 'warning',
        filePath,
        line: parseInt(line),
        kind: '',
        message
      })
      lastErrorIndex = annotations.length - 1
    } else if (message !== null) {
      if (lastErrorIndex !== null) {
        annotations[lastErrorIndex].message += `\n${message}`
      }
    }
  }

  return annotations
}

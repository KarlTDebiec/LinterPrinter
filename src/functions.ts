import fs from 'fs'
import path from 'path'

export function parseFileList (infile: string): string[] {
  const text = fs.readFileSync(infile, 'utf8')
  return text.split('\n').map(file => path.resolve(file))
}

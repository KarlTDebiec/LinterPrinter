import fs from 'fs'
import path from 'path'

export function parseFileList (infile: string): string[] {
  infile = path.resolve(infile)
  const fileContent = fs.readFileSync(infile, 'utf8')
  return fileContent.split('\n').map((file) => path.resolve(file))
}

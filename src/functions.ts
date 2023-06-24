import fs from 'fs'
import path from 'path'
import { Annotation } from './annotation'
export function formatAnnotation (annotation: Annotation): string {
  return (
    `::${annotation.level} ` +
    `file=${annotation.filePath},` +
    `line=${annotation.line}::` +
    `${annotation.source}[` +
    `${annotation.kind}] : ` +
    `${annotation.message}`
  )
}

export function parseFileList (infile: string): string[] {
  infile = path.resolve(infile)
  const fileContent = fs.readFileSync(infile, 'utf8')
  const githubWorkspace = process.env.GITHUB_WORKSPACE || ''

  return JSON.parse(fileContent).map((file: string) => {
    const resolvedPath = path.resolve(file)
    return resolvedPath.startsWith(githubWorkspace)
      ? resolvedPath.substring(githubWorkspace.length + 1)
      : resolvedPath
  })
}

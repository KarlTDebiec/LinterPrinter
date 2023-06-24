import fs from 'fs'
import path from 'path'

export function parseFileList (infile: string): string[] {
  infile = path.resolve(infile)
  const fileContent = fs.readFileSync(infile, 'utf8')
  console.log(`fileContent: ${fileContent}`)

  const githubWorkspace = process.env.GITHUB_WORKSPACE || ''
  const filePaths = fileContent.split('\n').map((file) => {
    const resolvedPath = path.resolve(file)
    return resolvedPath.startsWith(githubWorkspace)
      ? resolvedPath.substring(githubWorkspace.length + 1)
      : resolvedPath
  })

  return filePaths
}

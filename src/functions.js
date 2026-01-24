const fs = require('fs')
const path = require('path')

function formatAnnotation (annotation) {
  const sanitizedMessage = annotation.message.replace(/:/g, '：')

  return (
    `::${annotation.level} ` +
    `file=${annotation.filePath},` +
    `line=${annotation.line}::` +
    `${annotation.source}[` +
    `${annotation.kind}] : ` +
    `${sanitizedMessage}`
  )
}

function parseFileList (infile) {
  infile = path.resolve(infile)
  const fileContent = fs.readFileSync(infile, 'utf8')
  const githubWorkspace = process.env.GITHUB_WORKSPACE || ''

  return JSON.parse(fileContent).map((file) => {
    const resolvedPath = path.resolve(file)
    return resolvedPath.startsWith(githubWorkspace)
      ? resolvedPath.substring(githubWorkspace.length + 1)
      : resolvedPath
  })
}

function isWindowsPath (filePath) {
  return /^[A-Za-z]:[\\/]/.test(filePath) || filePath.includes('\\')
}

function normalizeFilePath (filePath) {
  const githubWorkspace = process.env.GITHUB_WORKSPACE || ''
  const useWindows = isWindowsPath(filePath) || isWindowsPath(githubWorkspace)
  const pathImpl = useWindows ? path.win32 : path.posix
  const absoluteFilePath = pathImpl.isAbsolute(filePath)
    ? filePath
    : pathImpl.join(githubWorkspace, filePath)

  const relativeFilePath = githubWorkspace
    ? pathImpl.relative(githubWorkspace, absoluteFilePath)
    : absoluteFilePath

  return useWindows
    ? relativeFilePath.replace(/\\/g, '/')
    : relativeFilePath
}

module.exports = { formatAnnotation, normalizeFilePath, parseFileList }

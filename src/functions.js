const fs = require('fs')
const path = require('path')

function formatAnnotation (annotation) {
  console.log(annotation)
  return (
    `::${annotation.level} ` +
    `file=${annotation.filePath},` +
    `line=${annotation.line}::` +
    `${annotation.source}[` +
    `${annotation.kind}] : ` +
    `${annotation.message}`
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

module.exports = { formatAnnotation, parseFileList }

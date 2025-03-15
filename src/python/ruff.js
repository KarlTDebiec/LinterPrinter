const fs = require('fs')
const path = require('path')

function parseRuff (infile) {
  console.log(`parseRuff() called with infile: ${infile}`)

  if (!fs.existsSync(infile)) {
    console.log(`File not found: ${infile}`)
    return []
  }

  const fileContent = fs.readFileSync(infile, 'utf8')

  if (!fileContent) {
    console.log(`Empty file: ${infile}`)
    return []
  }

  const lines = fileContent.split('\n').filter(line => line.trim() !== '')
  const annotations = []

  for (const line of lines) {
    const match = line.match(
      /^(?<filePath>[^:]+):(?<line>\d+):(?<column>\d+): (?<code>\S+) (?<message>.+)$/)

    if (!match || !match.groups) {
      console.log(`Could not parse line: ${line}`)
      continue
    }

    const { filePath, line: lineNumber, column, code, message } = match.groups

    // Normalize path to relative
    const githubWorkspace = process.env.GITHUB_WORKSPACE || ''
    const absoluteFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(githubWorkspace, filePath)

    let relativeFilePath = path.relative(githubWorkspace, absoluteFilePath)
    relativeFilePath = relativeFilePath.split(path.sep).join('/')

    annotations.push({
      source: 'ruff',
      level: 'warning', // Ruff messages are usually warnings
      filePath: relativeFilePath,
      line: parseInt(lineNumber, 10),
      kind: code,
      message: message.trim(),
      // Optional: column: parseInt(column, 10)
    })
  }

  console.log(`Parsed ${annotations.length} ruff annotations`)
  return annotations
}

module.exports = { parseRuff }

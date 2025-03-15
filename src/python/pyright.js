const fs = require('fs')
const path = require('path')

const pyrightRegex = /^(?<filePath>.+):(?<line>\d+):(?<column>\d+) - (?<level>\w+): (?<message>.+?) \((?<kind>.+?)\)$/

function parsePyright (infile) {
  console.log(`parsePyright() called with infile: ${infile}`)

  if (!fs.existsSync(infile)) {
    console.log(`File not found: ${infile}`)
    return []
  }

  const fileContent = fs.readFileSync(infile, 'utf8')

  if (!fileContent) {
    console.log(`Empty file: ${infile}`)
    return []
  }

  const lines = fileContent.split('\n').
    map(line => line.trim()).
    filter(line => pyrightRegex.test(line)) // only main lines

  const annotations = []

  for (const line of lines) {
    const match = line.match(pyrightRegex)

    if (!match || !match.groups) {
      console.log(`Could not parse line: ${line}`)
      continue
    }

    const {
      filePath,
      line: lineNumber,
      column,
      level,
      message,
      kind,
    } = match.groups

    const githubWorkspace = process.env.GITHUB_WORKSPACE || ''
    const absoluteFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(githubWorkspace, filePath)

    let relativeFilePath = path.relative(githubWorkspace, absoluteFilePath)
    relativeFilePath = relativeFilePath.split(path.sep).join('/')

    annotations.push({
      source: 'pyright',
      level: 'warning',
      filePath: relativeFilePath,
      line: parseInt(lineNumber, 10),
      kind: kind.trim(),
      message: message.trim(),
    })
  }

  console.log(`Parsed ${annotations.length} pyright annotations`)
  return annotations
}

module.exports = { parsePyright }

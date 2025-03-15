const fs = require('fs')

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

  console.log(
    `File exists and is not empty. Contents:\n${fileContent.slice(0, 500)}`) // First 500 chars

  // Stub - no annotations yet
  return []
}

module.exports = { parseRuff }

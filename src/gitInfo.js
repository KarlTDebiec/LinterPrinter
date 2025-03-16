const { execSync } = require('child_process')

function getGitDiffFiles (baseRef = 'origin/master', headRef = 'HEAD') {
  try {
    const added = execSync(
      `git diff --diff-filter=A --name-only ${baseRef} ${headRef}`, {
        encoding: 'utf-8',
      }).trim().split('\n').filter(Boolean)

    const modified = execSync(
      `git diff --diff-filter=M --name-only ${baseRef} ${headRef}`, {
        encoding: 'utf-8',
      }).trim().split('\n').filter(Boolean)

    console.log(`Added files: ${JSON.stringify(added)}`)
    console.log(`Modified files: ${JSON.stringify(modified)}`)

    return { added, modified }
  } catch (error) {
    console.error(`Failed to get git diff files: ${error.message}`)
    return { added: [], modified: [] }
  }
}

module.exports = { getGitDiffFiles }

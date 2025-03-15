const { execSync } = require('child_process')

function getGitDiffFiles (baseRef = 'origin/master', headRef = 'HEAD') {
  try {
    // Get added files
    const added = execSync(
      `git diff --diff-filter=A --name-only ${baseRef} ${headRef}`, {
        encoding: 'utf-8',
      }).trim().split('\n').filter(line => line)

    // Get modified files
    const modified = execSync(
      `git diff --diff-filter=M --name-only ${baseRef} ${headRef}`, {
        encoding: 'utf-8',
      }).trim().split('\n').filter(line => line)

    console.log(`Added files: ${JSON.stringify(added)}`)
    console.log(`Modified files: ${JSON.stringify(modified)}`)

    return { added, modified }
  } catch (error) {
    console.error(`Failed to get git diff files: ${error.message}`)
    return { added: [], modified: [] }
  }
}

module.exports = { getGitDiffFiles }

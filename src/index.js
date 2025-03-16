const core = require('@actions/core')
const { formatAnnotation } = require('./functions')
const { parsePyright } = require('./python/pyright')
const { parsePytest } = require('./python/pytest')
const { parseRuff } = require('./python/ruff')
const { getGitDiffFiles } = require('./gitInfo')

async function run () {
  try {
    const tool = core.getInput('tool')
    const toolInfile = core.getInput('tool_infile')

    const supportedTools = ['pyright', 'pytest', 'ruff']

    if (!supportedTools.includes(tool)) {
      throw new Error(
        `Unsupported tool: '${tool}', options are ${supportedTools}`,
      )
    }

    let annotations = []

    if (tool === 'pyright') {
      annotations = parsePyright(toolInfile)
    } else if (tool === 'pytest') {
      annotations = parsePytest(toolInfile)
    } else if (tool === 'ruff') {
      annotations = parseRuff(toolInfile)
    }

    // Prioritize annotations
    const defaultBranch = process.env.DEFAULT_BRANCH || 'master'
    const { added, modified } = getGitDiffFiles(`origin/${defaultBranch}`,
      'HEAD')

    const prioritizedAnnotations = [
      ...annotations.filter(ann => added.includes(ann.filePath)),
      ...annotations.filter(ann => modified.includes(ann.filePath) &&
        !added.includes(ann.filePath)),
      ...annotations.filter(ann => !added.includes(ann.filePath) &&
        !modified.includes(ann.filePath)),
    ]

    // Output annotations
    for (const annotation of prioritizedAnnotations) {
      console.log(formatAnnotation(annotation))
    }

    // Check for any "error" level annotations
    const errorAnnotations = prioritizedAnnotations.filter(
      ann => ann.level === 'error',
    )

    if (errorAnnotations.length > 0) {
      core.setFailed(
        `Found ${errorAnnotations.length} error annotation${errorAnnotations.length >
        1 ? 's' : ''}.`,
      )
    }

  } catch (error) {
    core.setFailed(error.message || error.toString())
  }
}

run()

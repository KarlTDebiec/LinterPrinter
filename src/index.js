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
    const { added, modified } = getGitDiffFiles()

    const prioritizedAnnotations = [
      ...annotations.filter(ann => added.includes(ann.filePath)),
      ...annotations.filter(ann => modified.includes(ann.filePath) &&
        !added.includes(ann.filePath)),
      ...annotations.filter(ann => !added.includes(ann.filePath) &&
        !modified.includes(ann.filePath)),
    ]

    // Output
    for (const annotation of prioritizedAnnotations) {
      console.log(formatAnnotation(annotation))
    }

  } catch (error) {
    core.setFailed(error.message || error.toString())
  }
}

run()

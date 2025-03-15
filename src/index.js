const core = require('@actions/core')
const { parsePytest } = require('./python/pytest')
const { formatAnnotation, parseFileList } = require('./functions')

async function run () {
  try {
    const tool = core.getInput('tool')
    const toolInfile = core.getInput('tool_infile')

    const supportedTools = [
      'pytest',
    ]

    if (!supportedTools.includes(tool)) {
      throw new Error(
        `Unsupported tool: '${tool}', options are ${supportedTools}`)
    }

    let annotations = []

    if (tool === 'pytest') {
      annotations = parsePytest(toolInfile)
    }

    let filesToAnnotate = null

    for (const annotation of annotations) {
      console.log(formatAnnotation(annotation))
    }
  } catch (error) {
    core.setFailed(error.message || error.toString())
  }
}

run()

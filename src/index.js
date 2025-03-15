const core = require('@actions/core')
const { formatAnnotation, parseFileList } = require('./functions')
const { parsePyright } = require('./python/pyright')
const { parsePytest } = require('./python/pytest')
const { parseRuff } = require('./python/ruff')

async function run () {
  try {
    const tool = core.getInput('tool')
    const toolInfile = core.getInput('tool_infile')

    const supportedTools = [
      'pyright',
      'pytest',
      'ruff',
    ]

    if (!supportedTools.includes(tool)) {
      throw new Error(
        `Unsupported tool: '${tool}', options are ${supportedTools}`)
    }

    let annotations = []

    if (tool === 'pyright') {
      annotations = parsePyright(toolInfile)
    } else if (tool === 'pytest') {
      annotations = parsePytest(toolInfile)
    } else if (tool === 'ruff') {
      annotations = parseRuff(toolInfile)
    }

    for (const annotation of annotations) {
      console.log(formatAnnotation(annotation))
    }
  } catch (error) {
    core.setFailed(error.message || error.toString())
  }
}

run()

const core = require('@actions/core')
const { parseProspectorJSON } = require('./python/prospector')
const { parsePydocstyle } = require('./python/pydocstyle')
const { parseMypy } = require('./python/mypy')
const { parsePyright } = require('./python/pyright')
const { parsePytest } = require('./python/pytest')
const { formatAnnotation, parseFileList } = require('./functions')

async function run () {
  try {
    const tool = core.getInput('tool')
    const toolInfile = core.getInput('tool_infile')
    const filesToAnnotateInfile = core.getInput('files_to_annotate_infile')

    const supportedTools = [
      'mypy',
      'prospector',
      'pydocstyle',
      'pyright',
      'pytest']

    if (!supportedTools.includes(tool)) {
      throw new Error(
        `Unsupported tool: '${tool}', options are ${supportedTools}`)
    }

    let annotations = []

    if (tool === 'mypy') {
      annotations = parseMypy(toolInfile)
    } else if (tool === 'prospector') {
      annotations = parseProspectorJSON(toolInfile)
    } else if (tool === 'pydocstyle') {
      annotations = parsePydocstyle(toolInfile)
    } else if (tool === 'pyright') {
      annotations = parsePyright(toolInfile)
    } else if (tool === 'pytest') {
      annotations = parsePytest(toolInfile)
    }

    let filesToAnnotate = null
    if (filesToAnnotateInfile && filesToAnnotateInfile !== '') {
      filesToAnnotate = parseFileList(filesToAnnotateInfile)
    }

    for (const annotation of annotations) {
      if (filesToAnnotate === null ||
        filesToAnnotate.includes(annotation.filePath)) {
        console.log(formatAnnotation(annotation))
      }
    }
  } catch (error) {
    core.setFailed(error.message || error.toString())
  }
}

run()

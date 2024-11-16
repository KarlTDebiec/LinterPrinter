import * as core from '@actions/core'
import { parseProspectorJSON } from './python/prospector'
import { parsePydocstyle } from './python/pydocstyle'
import { parseMypy } from './python/mypy'
import { parsePyright } from './python/pyright'
import { parsePytest } from './python/pytest'
import { formatAnnotation, parseFileList } from './functions'
import { Annotation } from './annotation'

async function run (): Promise<void> {
  try {
    const tool: string = core.getInput('tool')
    const toolInfile: string = core.getInput('tool_infile')
    const filesToAnnotateInfile: string = core.getInput(
      'files_to_annotate_infile'
    )

    // Identify tool
    const supportedTools = ['mypy', 'prospector', 'pydocstyle', 'pyright', 'pytest']
    if (!supportedTools.includes(tool)) {
      throw new Error(
        `Unsupported tool: '${tool}', options are ${supportedTools}`
      )
    }

    // Parse tool output
    let annotations: Annotation[] = []
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

    // Parse files to annotate
    let filesToAnnotate = null
    if (filesToAnnotateInfile && filesToAnnotateInfile !== '') {
      filesToAnnotate = parseFileList(filesToAnnotateInfile)
    }

    // Print annotations
    for (const annotation of annotations) {
      if (filesToAnnotate === null || filesToAnnotate.includes(annotation.filePath)) {
        console.log(formatAnnotation(annotation))
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()

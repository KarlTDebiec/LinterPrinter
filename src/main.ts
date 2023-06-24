import * as core from '@actions/core'
import { parseProspectorJSON } from './python/prospector'
import { parsePydocstyle } from './python/pydocstyle'
import { parseMypy } from './python/mypy'
import { parsePytest } from './python/pytest'
import { parseFileList } from './functions'
import { Annotation } from './annotation'

async function run (): Promise<void> {
  try {
    const tool: string = core.getInput('tool')
    const toolInfile: string = core.getInput('tool_infile')
    const filesToAnnotateInfile: string = core.getInput(
      'files_to_annotate_infile'
    )

    // Identify tool
    console.log(`tool: ${tool}`)
    const supportedTools = ['prospector', 'pydocstyle', 'mypy', 'pytest']
    if (!supportedTools.includes(tool)) {
      throw new Error(`Unsupported tool: ${tool}`)
    }

    // Parse tool output
    console.log(`toolInfile: ${toolInfile}`)
    let annotations: Annotation[] = []
    if (tool === 'prospector') {
      annotations = parseProspectorJSON(toolInfile)
    } else if (tool === 'pydocstyle') {
      annotations = parsePydocstyle(toolInfile)
    } else if (tool === 'mypy') {
      annotations = parseMypy(toolInfile)
    } else if (tool === 'pytest') {
      annotations = parsePytest(toolInfile)
    }

    // Parse files to annotate
    console.log(`filesToAnnotateInfile: ${filesToAnnotateInfile}`)
    const filesToAnnotate = parseFileList(filesToAnnotateInfile)

    // Print annotations
    for (const annotation of annotations) {
      if (filesToAnnotate.includes(annotation.filePath)) {
        console.log(annotation)
      }
    }
  } catch
  (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

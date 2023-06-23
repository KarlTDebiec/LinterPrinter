import * as core from '@actions/core'

async function run (): Promise<void> {
  try {
    const tool: string = core.getInput('tool')
    const toolInfile: string = core.getInput('tool_infile')
    const filesToAnnotateInfile: string = core.getInput(
      'files_to_annotate_infile'
    )
    console.log(`tool: ${tool}`)
    console.log(`toolInfile: ${toolInfile}`)
    console.log(`filesToAnnotateInfile: ${filesToAnnotateInfile}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

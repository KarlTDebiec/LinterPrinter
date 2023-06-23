import * as core from '@actions/core'

async function run (): Promise<void> {
  try {
    const tool: string = core.getInput('tool')
    const tool_infile: string = core.getInput('tool_infile')
    const files_to_annotate_infile: string = core.getInput(
      'files_to_annotate_infile'
    )
    const ms: string = core.getInput('milliseconds')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

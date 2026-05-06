const path = require('path')
const assert = require('assert/strict')
const { execFileSync } = require('child_process')

const repoRoot = path.resolve(__dirname, '..')
const distEntry = path.join(repoRoot, 'dist', 'index.js')

function fixturePath (...parts) {
  return path.join(repoRoot, 'testdata', ...parts)
}

function runTest (name, fn) {
  try {
    fn()
    console.log(`ok - ${name}`)
  } catch (error) {
    console.error(`not ok - ${name}`)
    console.error(error)
    process.exitCode = 1
  }
}

function runAction (tool, infile, workspace) {
  return execFileSync('node', [distEntry], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      INPUT_TOOL: tool,
      INPUT_TOOL_INFILE: infile,
      GITHUB_WORKSPACE: workspace,
      LINTERPRINTER_TEST_MODE: 'true',
    },
  })
}

runTest('dist/index.js handles ruff JSON output (scinoephile)', () => {
  const output = runAction(
    'ruff',
    fixturePath('scinoephile', 'ruff.json'),
    '/Users/karldebiec/Code/Scinoephile',
  )

  assert.ok(output.includes('::warning'))
  assert.ok(output.includes('file=scinoephile/cli/scinoephile_cli.py'))
  assert.ok(output.includes('ruff[PLR0912]'))
})

runTest('dist/index.js handles ruff JSON output (pipescaler)', () => {
  const output = runAction(
    'ruff',
    fixturePath('pipescaler', 'ruff.json'),
    '/Users/karldebiec/Code/PipeScaler',
  )

  assert.ok(output.includes('::warning'))
  assert.ok(output.includes('file=pipescaler/file_scanner.py'))
  assert.ok(output.includes('ruff[PLR0913]'))
})

runTest('dist/index.js handles ruff JSON output (oot3dhdtextgenerator)', () => {
  const output = runAction(
    'ruff',
    fixturePath('oot3dhdtextgenerator', 'ruff.json'),
    '/Users/karldebiec/Code/OOT3DHDTextGenerator',
  )

  assert.ok(output.includes('::warning'))
  assert.ok(output.includes('file=oot3dhdtextgenerator/apps/char_assigner/char_assigner.py'))
  assert.ok(output.includes('ruff[D102]'))
})

runTest('dist/index.js handles pyright JSON output (scinoephile)', () => {
  const output = runAction(
    'pyright',
    fixturePath('scinoephile', 'pyright.json'),
    '/Users/karldebiec/Code/Scinoephile',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=scinoephile/analysis/series_diff.py'))
  assert.ok(output.includes('pyright[reportAttributeAccessIssue]'))
})

runTest('dist/index.js handles pyright JSON output (pipescaler)', () => {
  const output = runAction(
    'pyright',
    fixturePath('pipescaler', 'pyright.json'),
    '/Users/karldebiec/Code/PipeScaler',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=pipescaler/core/cli/utility_cli.py'))
  assert.ok(output.includes('pyright[reportAttributeAccessIssue]'))
})

runTest('dist/index.js handles pyright JSON output (oot3dhdtextgenerator)', () => {
  const output = runAction(
    'pyright',
    fixturePath('oot3dhdtextgenerator', 'pyright.json'),
    '/Users/karldebiec/Code/OOT3DHDTextGenerator',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=oot3dhdtextgenerator/apps/char_assigner/char_assigner.py'))
  assert.ok(output.includes('pyright[reportArgumentType]'))
})

runTest('dist/index.js handles ty JSON output (scinoephile)', () => {
  const output = runAction(
    'ty',
    fixturePath('scinoephile', 'ty.json'),
    '/Users/karldebiec/Code/Scinoephile',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=scinoephile/analysis/series_diff.py'))
  assert.ok(output.includes('ty[unresolved-attribute]'))
})

runTest('dist/index.js handles ty JSON output (pipescaler)', () => {
  const output = runAction(
    'ty',
    fixturePath('pipescaler', 'ty.json'),
    '/Users/karldebiec/Code/PipeScaler',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=pipescaler/common/argument_parsing.py'))
  assert.ok(output.includes('ty[unresolved-reference]'))
})

runTest('dist/index.js handles ty JSON output (oot3dhdtextgenerator)', () => {
  const output = runAction(
    'ty',
    fixturePath('oot3dhdtextgenerator', 'ty.json'),
    '/Users/karldebiec/Code/OOT3DHDTextGenerator',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=oot3dhdtextgenerator/apps/char_assigner/char_assigner.py'))
  assert.ok(output.includes('ty[invalid-argument-type]'))
})

runTest('dist/index.js handles pytest text output (pipescaler)', () => {
  const output = runAction(
    'pytest',
    fixturePath('pipescaler', 'pytest.txt'),
    '/Users/karldebiec/Code/PipeScaler',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('pytest['))
})

runTest('dist/index.js handles pytest failures reported only in the short summary', () => {
  const output = runAction(
    'pytest',
    fixturePath('scinoephile', 'pytest-failed-summary.txt'),
    '/home/runner/work/Scinoephile/Scinoephile',
  )

  assert.ok(output.includes('::error'))
  assert.ok(output.includes('file=cli/dictionary/test_dictionary_cli.py'))
  assert.ok(output.includes('pytest[AssertionError]'))
})

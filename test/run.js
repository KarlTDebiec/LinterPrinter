const path = require('path')
const assert = require('assert/strict')

const { parsePyright } = require('../src/python/pyright')
const { parsePytest } = require('../src/python/pytest')
const { parseRuff } = require('../src/python/ruff')
const { parseTy } = require('../src/python/ty')

const repoRoot = path.resolve(__dirname, '..')

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

runTest('parseRuff() handles JSON output (scinoephile)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\Scinoephile'
  const annotations = parseRuff(fixturePath('scinoephile', 'ruff.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ruff')
  assert.equal(annotations[0].level, 'warning')
  assert.equal(annotations[0].filePath, 'scinoephile/cli/scinoephile_cli.py')
  assert.equal(annotations[0].line, 124)
  assert.equal(annotations[0].kind, 'PLR0912')
})

runTest('parseRuff() handles JSON output (pipescaler)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\PipeScaler'
  const annotations = parseRuff(fixturePath('pipescaler', 'ruff.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ruff')
  assert.equal(annotations[0].level, 'warning')
  assert.equal(annotations[0].filePath, 'pipescaler/file_scanner.py')
  assert.equal(annotations[0].line, 26)
  assert.equal(annotations[0].kind, 'PLR0913')
})

runTest('parseRuff() handles JSON output (oot3dhdtextgenerator)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\OOT3DHDTextGenerator'
  const annotations = parseRuff(fixturePath('oot3dhdtextgenerator', 'ruff.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ruff')
  assert.equal(annotations[0].level, 'warning')
  assert.equal(annotations[0].filePath, 'oot3dhdtextgenerator/apps/char_assigner/char_assigner.py')
  assert.equal(annotations[0].line, 77)
  assert.equal(annotations[0].kind, 'D102')
})

runTest('parsePyright() handles JSON output (scinoephile)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\Scinoephile'
  const annotations = parsePyright(fixturePath('scinoephile', 'pyright.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'pyright')
  assert.equal(annotations[0].level, 'error')
  assert.equal(annotations[0].filePath, 'scinoephile/audio/subtitles/series.py')
  assert.equal(annotations[0].line, 41)
  assert.equal(annotations[0].kind, 'reportIncompatibleVariableOverride')
})

runTest('parsePyright() handles JSON output (pipescaler)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\PipeScaler'
  const annotations = parsePyright(fixturePath('pipescaler', 'pyright.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'pyright')
  assert.equal(annotations[0].level, 'error')
  assert.equal(annotations[0].filePath, 'pipescaler/cli/pipescaler_cli.py')
  assert.equal(annotations[0].line, 11)
  assert.equal(annotations[0].kind, 'reportAttributeAccessIssue')
})

runTest('parsePyright() handles JSON output (oot3dhdtextgenerator)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\OOT3DHDTextGenerator'
  const annotations = parsePyright(fixturePath('oot3dhdtextgenerator', 'pyright.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'pyright')
  assert.equal(annotations[0].level, 'error')
  assert.equal(
    annotations[0].filePath,
    'oot3dhdtextgenerator/apps/char_assigner/char_assigner.py',
  )
  assert.equal(annotations[0].line, 17)
  assert.equal(annotations[0].kind, 'reportAttributeAccessIssue')
})

runTest('parseTy() handles GitLab JSON output (scinoephile)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\Scinoephile'
  const annotations = parseTy(fixturePath('scinoephile', 'ty.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ty')
  assert.equal(annotations[0].level, 'error')
  assert.equal(annotations[0].filePath, 'scinoephile/audio/subtitles/series.py')
  assert.equal(annotations[0].line, 149)
  assert.equal(annotations[0].kind, 'non-subscriptable')
})

runTest('parseTy() handles GitLab JSON output (pipescaler)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\PipeScaler'
  const annotations = parseTy(fixturePath('pipescaler', 'ty.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ty')
  assert.equal(annotations[0].level, 'error')
  assert.equal(annotations[0].filePath, 'pipescaler/cli/pipescaler_cli.py')
  assert.equal(annotations[0].line, 11)
  assert.equal(annotations[0].kind, 'unresolved-import')
})

runTest('parseTy() handles GitLab JSON output (oot3dhdtextgenerator)', () => {
  process.env.GITHUB_WORKSPACE = 'C:\\Users\\karls\\Code\\OOT3DHDTextGenerator'
  const annotations = parseTy(fixturePath('oot3dhdtextgenerator', 'ty.json'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'ty')
  assert.equal(annotations[0].level, 'error')
  assert.equal(
    annotations[0].filePath,
    'oot3dhdtextgenerator/apps/char_assigner/char_assigner.py',
  )
  assert.equal(annotations[0].line, 17)
  assert.equal(annotations[0].kind, 'unresolved-import')
})

runTest('parsePytest() handles text output (scinoephile)', () => {
  const annotations = parsePytest(fixturePath('scinoephile', 'pytest.txt'))

  assert.equal(annotations.length, 0)
})

runTest('parsePytest() handles text output (pipescaler)', () => {
  const annotations = parsePytest(fixturePath('pipescaler', 'pytest.txt'))

  assert.ok(annotations.length > 0)
  assert.equal(annotations[0].source, 'pytest')
  assert.equal(annotations[0].level, 'error')
})

runTest('parsePytest() handles text output (oot3dhdtextgenerator)', () => {
  const annotations = parsePytest(fixturePath('oot3dhdtextgenerator', 'pytest.txt'))

  assert.equal(annotations.length, 0)
})

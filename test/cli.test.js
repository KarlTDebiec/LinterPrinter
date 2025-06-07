const { test } = require('node:test');
const assert = require('assert');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCli(tool, infile) {
  return execFileSync('node', ['src/index.js'], {
    env: {
      ...process.env,
      INPUT_TOOL: tool,
      INPUT_TOOL_INFILE: infile,
      GITHUB_WORKSPACE: process.cwd(),
    },
    encoding: 'utf8',
  });
}

test('runs linter-printer with pyright output', () => {
  const tmpdir = fs.mkdtempSync(path.join(__dirname, 'tmp-'));
  const outfile = path.join(tmpdir, 'pyright.txt');
  fs.writeFileSync(outfile, 'test.py:1:1 - error: bad error (reportError)\n');

  const output = runCli('pyright', outfile);

  assert.match(output, /::warning file=test.py,line=1::pyright\[reportError\] : bad error/);

  fs.rmSync(tmpdir, { recursive: true, force: true });
});

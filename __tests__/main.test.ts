import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import { expect, test } from '@jest/globals'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
})

test('wait 500 ms', async () => {
  const start = new Date()
  const end = new Date()
  const delta = Math.abs(end.getTime() - start.getTime())
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env.INPUT_MILLISECONDS = '500'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})

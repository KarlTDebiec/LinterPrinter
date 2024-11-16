/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../typescript-action-main/src/main'

// Mock the action's entrypoint
const runMock = jest.spyOn(main, 'run').mockImplementation()

describe('index', () => {
  it('calls run when imported', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../typescript-action-main/src')

    expect(runMock).toHaveBeenCalled()
  })
})

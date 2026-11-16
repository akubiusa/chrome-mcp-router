import { describe, expect, it } from 'vitest'
import { parseJsonRpcMessage } from '../bridge'

describe('parseJsonRpcMessage', () => {
  it.each([
    { jsonrpc: '2.0', id: 0, method: 'initialize', params: {} },
    { jsonrpc: '2.0', id: 'request-1', method: 'tools/list' },
    { jsonrpc: '2.0', method: 'notifications/initialized' },
    { jsonrpc: '2.0', id: 1, result: null },
    {
      jsonrpc: '2.0',
      id: 'request-1',
      error: { code: -32_000, message: 'Disconnected' }
    }
  ])('returns the original message for %j', (message) => {
    expect(parseJsonRpcMessage(message)).toBe(message)
  })

  it.each([
    { jsonrpc: '2.0', id: 0 },
    { jsonrpc: '2.0', id: '' },
    { jsonrpc: '2.0', method: '' },
    { jsonrpc: '2.0', id: 1, method: false },
    { jsonrpc: '2.0', id: null, method: 'initialize' },
    { jsonrpc: '2.0', id: false, method: 'initialize' },
    { jsonrpc: '2.0', method: 'tools/list', params: false },
    { jsonrpc: '2.0', id: 1, result: true, error: false },
    { jsonrpc: '2.0', id: 1, error: 'unchecked' }
  ])(
    'accepts %j under the shallow check without validating other fields',
    (message) => {
      expect(parseJsonRpcMessage(message)).toBe(message)
    }
  )

  it.each([
    null,
    true,
    1,
    'message',
    [],
    [{ jsonrpc: '2.0', id: 1 }],
    {},
    { id: 1, method: 'initialize' },
    { jsonrpc: '1.0', id: 1, method: 'initialize' },
    { jsonrpc: 2, id: 1, method: 'initialize' },
    { jsonrpc: '2.0' },
    { jsonrpc: '2.0', id: null },
    { jsonrpc: '2.0', id: false },
    { jsonrpc: '2.0', id: {} },
    { jsonrpc: '2.0', method: 1 },
    { jsonrpc: '2.0', method: null },
    { jsonrpc: '2.0', method: {} },
    { jsonrpc: '2.0', id: false, method: 1 }
  ])('rejects %j when the envelope check fails', (message) => {
    expect(parseJsonRpcMessage(message)).toBeNull()
  })
})

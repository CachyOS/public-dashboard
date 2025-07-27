import {describe, expect, test} from 'bun:test';

import {FetcherError} from './errors';
import {processResponse, ResponseType} from './fetcher';

function mockResponse({
  json = {},
  jsonThrows = false,
  ok = true,
  status = 200,
  statusText = 'OK',
  url = 'http://test',
} = {}) {
  return {
    json: jsonThrows
      ? () => {
          throw new Error('Invalid JSON');
        }
      : () => Promise.resolve(json),
    ok,
    status,
    statusText,
    url,
  } as Response;
}

describe('processResponse', () => {
  test('returns JSON when response is ok', async () => {
    const res = mockResponse({json: {foo: 'bar'}});
    const data = await processResponse<{foo: string}>(res, 'json');
    expect(data).toEqual({foo: 'bar'});
  });

  test('throws FetcherError with parsed json when response is not ok', () => {
    const res = mockResponse({
      json: {code: '400', message: 'not found (really)'},
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    expect(processResponse(res, 'json')).rejects.toThrow(FetcherError);
    expect(processResponse(res, 'json')).rejects.toMatchObject({
      message: 'not found (really)',
      status: 400,
    });
  });

  test('throws FetcherError on invalid JSON', () => {
    const res = mockResponse({jsonThrows: true});
    expect(processResponse(res, 'json')).rejects.toThrow(FetcherError);
  });

  test('throws error on unsupported response mode', () => {
    const res = mockResponse();
    expect(processResponse(res, 'text' as ResponseType)).rejects.toThrow(
      'Unsupported response mode'
    );
  });
});

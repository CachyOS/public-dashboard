// thanks to https://github.com/CachyOS/builder-dashboard/blob/main/lib/fetcher.ts ;)
import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

import {FetcherError} from '@/lib/errors';

const EndpointURL =
  process.env.PUBLIC_ENDPOINT_URL ?? 'http://localhost:5862/api';

export type ResponseType = 'json';

export default async function fetcher<T>(
  path: string,
  clientHeaders: ReadonlyHeaders,
  init?: RequestInit,
  baseURL = EndpointURL,
  responseMode: ResponseType = 'json'
): Promise<T> {
  return fetch(`${baseURL}${path}`, {
    cache: 'force-cache',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': clientHeaders.get('User-Agent') ?? 'RepoManageServer/1.0.0',
      'X-Forwarded-For':
        clientHeaders.get('CF-Connecting-IP') ??
        clientHeaders.get('X-Forwarded-For') ??
        '',
      ...init?.headers,
    },
    // revalidate(expire) data after hour
    next: {revalidate: 3600},
    ...init,
  }).then(res => processResponse<T>(res, responseMode));
}

export async function processResponse<T>(
  response: Response,
  mode: ResponseType
): Promise<T> {
  if (mode !== 'json') {
    throw new Error(
      `Unsupported response mode "${mode}" for URL "${response.url}". Status: ${response.status} ${response.statusText}.`
    );
  }

  let json;
  try {
    json = await response.json();
  } catch (error) {
    console.warn(`Failed to parse JSON response from ${response.url}:`, error);
    throw new FetcherError(response.status, 'Invalid JSON response');
  }

  if (!response.ok) {
    throw new FetcherError(
      response.status,
      response.statusText || 'Fetch error',
      json
    );
  }

  return json satisfies Promise<T>;
}

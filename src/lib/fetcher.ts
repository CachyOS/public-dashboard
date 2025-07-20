// thanks to https://github.com/CachyOS/builder-dashboard/blob/main/lib/fetcher.ts ;)
import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

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

export function processResponse<T>(
  response: Response,
  mode: ResponseType
): Promise<T> {
  switch (mode) {
    case 'json':
      return response.json() as Promise<T>;
  }
}

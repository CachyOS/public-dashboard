// thanks to https://github.com/CachyOS/builder-dashboard/blob/main/lib/fetcher.ts ;)
import {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';
import {z} from 'zod';

import {FetcherError} from '@/lib/errors';
import {ErrorResponseSchema} from '@/lib/types';

export const EndpointURL = z
  .httpUrl()
  .default('http://localhost:5862/api')
  .parse(process.env.NEXT_PUBLIC_ENDPOINT_URL);

export type ResponseType = 'json';

export default async function fetcher<T extends z.ZodType>(
  path: string,
  clientHeaders: ReadonlyHeaders,
  schema: T,
  init?: RequestInit,
  baseURL?: string,
  responseMode?: ResponseType
): Promise<z.infer<T>>;
export default async function fetcher<T>(
  path: string,
  clientHeaders: ReadonlyHeaders,
  schema?: null,
  init?: RequestInit,
  baseURL?: string,
  responseMode?: ResponseType
): Promise<T>;
export default async function fetcher<T extends z.ZodType>(
  path: string,
  clientHeaders: ReadonlyHeaders,
  schema?: null | T,
  init?: RequestInit,
  baseURL = EndpointURL,
  responseMode: ResponseType = 'json'
) {
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
  }).then(res => processResponse(res, responseMode, schema));
}

export async function processResponse<T extends z.ZodType>(
  response: Response,
  mode: ResponseType,
  schema?: null | T
): Promise<z.infer<T>> {
  if (mode !== 'json') {
    throw new FetcherError(500, `Unsupported response mode: ${mode}`, {
      cause: `URL: "${response.url}". Status: ${response.status} ${response.statusText}.`,
    });
  }

  let json;
  try {
    json = await response.json();
  } catch (error) {
    throw new FetcherError(
      response.status,
      `Failed to parse JSON response from ${response.url}`,
      {
        cause: error,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
  }

  if (!response.ok) {
    const errorResponse = ErrorResponseSchema.safeParse(json);
    if (errorResponse.success) {
      throw new FetcherError(response.status, response.statusText, {
        cause: errorResponse.data,
      });
    }
    throw new FetcherError(response.status, response.statusText, {
      cause: `URL: "${response.url}"`,
    });
  }

  // skip if user didn't provide zod schema for the response
  if (!schema) {
    return json;
  }

  const parsed = schema.safeParse(json);
  if (parsed.error) {
    throw new FetcherError(
      500,
      `Failed to parse response from ${response.url}`,
      {
        cause: parsed.error,
        stack: parsed.error.stack,
      }
    );
  }

  return parsed.data;
}

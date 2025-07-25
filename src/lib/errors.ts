import {ErrorResponse} from '@/lib/types';

export class CacheError extends Error {
  constructor(
    message: string,
    public readonly operation: string
  ) {
    super(message);
    this.name = 'CacheError';
  }
}

export class FetcherError extends Error {
  payload?: ErrorResponse;
  status: number;
  constructor(status: number, message: string, payload?: ErrorResponse) {
    super(message);
    this.name = 'FetcherError';
    this.status = status;
    this.payload = payload;
  }
}

import {ErrorResponse} from './types';

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

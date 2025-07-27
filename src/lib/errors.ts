export class FetcherError extends Error {
  payload?: unknown;
  status: number;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'FetcherError';
    this.status = status;
    this.payload = payload;
  }
}

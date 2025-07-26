export class FetcherError extends Error {
  payload?: string;
  status: number;
  constructor(status: number, message: string, payload?: string) {
    super(message);
    this.name = 'FetcherError';
    this.status = status;
    this.payload = payload;
  }
}

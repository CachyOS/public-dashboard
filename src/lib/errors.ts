export class FetcherError extends Error {
  status: number;
  constructor(status: number, message: string, cause?: string, stack?: string) {
    super(message);
    this.name = 'FetcherError';
    this.status = status;
    this.cause = cause || 'Unknown cause';
    this.stack = stack || new Error().stack;
  }
}

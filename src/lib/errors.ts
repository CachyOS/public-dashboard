export class FetcherError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
    options?: {cause?: unknown; stack?: string}
  ) {
    super(
      message,
      options?.cause === undefined ? undefined : {cause: options.cause}
    );
    this.name = 'FetcherError';
    this.status = status;
    if (options?.stack) {
      this.stack = options.stack;
    }
  }
}

export class BingoException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
  ) {
    super(message);
    this.name = 'BingoException';
  }

  getError(): string | object | undefined {
    return `${this.code}: ${this.message}`;
  }
}
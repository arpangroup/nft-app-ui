/** Normalised error thrown by every adapter (mock or HTTP). UI only ever sees this shape. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const ErrorCodes = Object.freeze({
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  INVALID_INVITE: 'INVALID_INVITE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  LEVEL_TOO_LOW: 'LEVEL_TOO_LOW',
  RESERVATION_LIMIT: 'RESERVATION_LIMIT',
  NOT_SELLABLE: 'NOT_SELLABLE',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION',
});

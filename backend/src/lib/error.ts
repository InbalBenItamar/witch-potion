/**
 * The one error shape every non-2xx response uses, per the `error-handling`
 * skill. Never carries a stack trace, a secret, or the trouble text.
 */
export interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId: string;
}

export function errorBody(
  code: string,
  message: string,
  requestId: string,
  details?: Record<string, unknown>,
): ErrorBody {
  return {
    error: { code, message, ...(details ? { details } : {}) },
    requestId,
  };
}

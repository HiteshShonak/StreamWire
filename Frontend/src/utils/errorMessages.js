const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Unable to reach the server. Check your connection and try again.';
const AUTH_REQUIRED_MESSAGE = 'Please sign in to continue.';
const SESSION_EXPIRED_MESSAGE = 'Your session expired. Please sign in again.';

const sanitizeMessage = (message) => String(message || '').trim();

const normalizeMessage = (message) => sanitizeMessage(message).toLowerCase();

const hasKeyword = (normalizedMessage, keywords) =>
  keywords.some((keyword) => normalizedMessage.includes(String(keyword).toLowerCase()));

const getFirstFieldError = (fieldErrors) => {
  if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) {
    return '';
  }

  const first = fieldErrors[0];

  if (typeof first === 'string') {
    return sanitizeMessage(first);
  }

  if (first && typeof first.message === 'string') {
    return sanitizeMessage(first.message);
  }

  return '';
};

export const getFriendlyErrorMessage = (error, options = {}) => {
  const fallback = options.fallback || DEFAULT_MESSAGE;
  const mappings = Array.isArray(options.mappings) ? options.mappings : [];

  const rawMessage = sanitizeMessage(error?.message);
  const normalizedMessage = normalizeMessage(rawMessage);
  const statusCode = Number(error?.statusCode || error?.response?.status || 0);

  const fieldMessage = getFirstFieldError(
    error?.fieldErrors || error?.response?.data?.errors
  );
  if (fieldMessage) {
    return fieldMessage;
  }

  for (const mapping of mappings) {
    if (!mapping || typeof mapping.message !== 'string') {
      continue;
    }

    if (typeof mapping.when === 'function') {
      const matched = mapping.when({
        error,
        statusCode,
        rawMessage,
        normalizedMessage,
      });
      if (matched) {
        return mapping.message;
      }
      continue;
    }

    const checks = Array.isArray(mapping.when) ? mapping.when : [mapping.when];
    const matched = checks.some(
      (value) =>
        typeof value === 'string' &&
        normalizedMessage.includes(value.toLowerCase())
    );

    if (matched) {
      return mapping.message;
    }
  }

  if (
    hasKeyword(normalizedMessage, [
      'network error',
      'failed to fetch',
      'load failed',
      'timed out',
      'timeout',
      'econnrefused',
      'socket hang up',
    ])
  ) {
    return NETWORK_MESSAGE;
  }

  if (
    statusCode === 401 ||
    hasKeyword(normalizedMessage, [
      'unauthorized',
      'not authorized',
      'invalid token',
      'token expired',
      'jwt expired',
    ])
  ) {
    if (hasKeyword(normalizedMessage, ['expired', 'token'])) {
      return SESSION_EXPIRED_MESSAGE;
    }
    return AUTH_REQUIRED_MESSAGE;
  }

  if (statusCode === 403 || hasKeyword(normalizedMessage, ['forbidden', 'permission'])) {
    return 'You do not have permission to do this action.';
  }

  if (statusCode === 404 || hasKeyword(normalizedMessage, ['not found', 'does not exist'])) {
    return 'The requested content was not found.';
  }

  if (
    statusCode === 409 ||
    hasKeyword(normalizedMessage, ['already exists', 'duplicate', 'already'])
  ) {
    return 'This already exists. Please use a different value.';
  }

  if (
    statusCode === 413 ||
    hasKeyword(normalizedMessage, ['file too large', 'payload too large', 'too large'])
  ) {
    return 'The selected file is too large. Please choose a smaller file.';
  }

  if (
    statusCode === 429 ||
    hasKeyword(normalizedMessage, ['too many requests', 'rate limit', 'busy'])
  ) {
    return 'Too many requests right now. Please wait a moment and try again.';
  }

  if (statusCode >= 500 || hasKeyword(normalizedMessage, ['server error', 'internal server'])) {
    return 'Server error. Please try again in a moment.';
  }

  return rawMessage || fallback;
};

export const toActionError = (error, fallback, mappings = []) =>
  getFriendlyErrorMessage(error, { fallback, mappings });

export const Logger = {
  debug: (...args: any[]) => {
    if (__DEV__) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (__DEV__) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (__DEV__) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    // Errors should generally be captured in prod, but for strict noise reduction:
    if (__DEV__) console.error('[ERROR]', ...args);
  }
};

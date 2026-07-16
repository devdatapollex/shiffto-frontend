import { env } from '@/config/env.config';

/**
 * Custom Logger utility to handle console logs globally.
 * Logs are automatically disabled in production environment.
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const showLogs = env.NODE_ENV === 'development';

const formatMessage = (level: LogLevel, message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

/**
 * Redacts sensitive information from log arguments.
 */
const sanitize = (args: unknown[]): unknown[] => {
  const sensitiveKeys = ['password', 'token', 'secret', 'token', 'auth', 'key'];
  return args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      const sanitized = { ...arg } as Record<string, unknown>;
      for (const key in sanitized) {
        if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
          sanitized[key] = '[REDACTED]';
        }
      }
      return sanitized;
    }
    return arg;
  });
};

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (showLogs) {
      console.log(formatMessage('log', message), ...sanitize(args));
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (showLogs) {
      console.info(
        '%c' + formatMessage('info', message),
        'color: #3b82f6; font-weight: bold;',
        ...sanitize(args)
      );
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (showLogs) {
      console.warn(
        '%c' + formatMessage('warn', message),
        'color: #f59e0b; font-weight: bold;',
        ...sanitize(args)
      );
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // We usually want to show errors even in production, or send them to a service
    console.error(
      '%c' + formatMessage('error', message),
      'color: #ef4444; font-weight: bold;',
      ...sanitize(args)
    );
  },

  debug: (message: string, ...args: unknown[]) => {
    if (showLogs) {
      console.debug(
        '%c' + formatMessage('debug', message),
        'color: #8b5cf6; font-weight: bold;',
        ...sanitize(args)
      );
    }
  },

  table: (data: unknown) => {
    if (showLogs) {
      console.table(data);
    }
  },
};

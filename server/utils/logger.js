/**
 * utils/logger.js
 * Lightweight structured logger with timestamps and severity levels.
 */

const LEVELS = { ERROR: 'ERROR', WARN: 'WARN', INFO: 'INFO', STEP: 'STEP' };

const color = {
  ERROR: '\x1b[31m',   // red
  WARN:  '\x1b[33m',   // yellow
  INFO:  '\x1b[36m',   // cyan
  STEP:  '\x1b[35m',   // magenta
  RESET: '\x1b[0m',
};

function log(level, message) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const c = color[level] || '';
  console.log(`${c}[${ts}] [${level}] ${message}${color.RESET}`);
}

export const logger = {
  error: (msg) => log(LEVELS.ERROR, msg),
  warn:  (msg) => log(LEVELS.WARN,  msg),
  info:  (msg) => log(LEVELS.INFO,  msg),
  step:  (msg) => log(LEVELS.STEP,  msg),
};

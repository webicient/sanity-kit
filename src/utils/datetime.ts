/**
 * Returns the current date in ISO format (YYYY-MM-DD).
 *
 * @returns {string} The ISO date string.
 */
export function getISODateString(): string {
  return new Date()
    .toLocaleDateString()
    .replace(/\//g, '-')
    .split('-')
    .reverse()
    .join('-');
}

/**
 * Returns the current time in the format "HH:MM".
 *
 * @returns The current time as a string.
 */
export function getTime(): string {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes()}`;
}

/**
 * Returns the current date and time in the format "YYYY-MM-DD HH:MM".
 *
 * @returns The current date and time as a string.
 */
export function now(): string {
  return `${getISODateString()} ${getTime()}`;
}

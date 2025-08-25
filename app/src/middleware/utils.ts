/**
 * Removes all NUL characters from a string
 * @param str The string to sanitize
 * @returns The sanitized string if it includes NUL character(s), otherwise the original string
 */
export function stripNullCharactersFromString(str: string): string {
  return str.replace(/\u0000/g, ''); // eslint-disable-line no-control-regex
}

/**
 * Recursively sanitize JSON-like data (strings, arrays, plain objects)
 * @param value The value to sanitize
 * @returns The sanitized value if a string otherwise the original value
 */
export function sanitize<T>(value: T): T | string {
  // Strip NUL characters from strings
  if (typeof value === 'string') return stripNullCharactersFromString(value);

  // Recursively sanitize arrays items
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = sanitize(value[i]);
    }
    return value;
  }

  // Recursively sanitize plain objects
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) (value as Record<string, unknown>)[k] = sanitize(v);
    return value;
  }

  return value;
}

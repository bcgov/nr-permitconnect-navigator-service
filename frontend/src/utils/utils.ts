import { isAxiosError } from 'axios';
import { useToast } from '@/lib/primevue';
import { useConfigStore } from '@/store';
import { DELIMITER } from '@/utils/constants/application';
import { FileCategory, IdentityProviderKind } from '@/utils/enums/application';

import type { DateTimeStrings, IdentityProvider } from '@/types';
import type { ToastMessageOptions } from 'primevue/toast';

/**
 * Turns date text into a Date, with date-only strings parsed as local midnight, leaving anything else unchanged.
 * @param value - The raw input.
 * @returns The date, or the raw input.
 */
export function coerceDate(value: unknown) {
  return typeof value === 'string' ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value) : value;
}

/**
 * Turns numeric text into a number, leaving anything else unchanged.
 * @param value - The raw input.
 * @returns The number, or the raw input.
 */
export function coerceNumber(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
}

/**
 * Combines separate date and time strings into one Date, with a date-only string read as local midnight.
 * @param date - The date string.
 * @param time - The time string.
 * @returns The combined date, or null when there is no date.
 */
export function combineDateTime(date?: string | null, time?: string | null): Date | null {
  if (!date) return null;

  const [y, m, d] = date.split('-').map(Number);

  if (!time && y && m) {
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  return new Date(`${date}T${time}`);
}

/**
 * Splits a space, semicolon or comma separated string into its values.
 * @param value - The string to split.
 * @returns The non-empty values.
 */
export function delimitEmails(value: string): string[] {
  return value
    .split(/[\s;,]+/g)
    .map((s) => s.trim())
    .filter((s) => !!s);
}

/**
 * Builds a key/value differential of a source object against a comparer.
 * @param source - The source object.
 * @param comparer - The object to compare against.
 * @returns The key/value pairs of the source that differ from the comparer.
 */
export function differential<T extends Record<PropertyKey, unknown>>(source: T, comparer: Partial<T>): Partial<T> {
  return Object.fromEntries(
    (Object.entries(source) as [keyof T, T[keyof T]][]).filter(([key, value]) => comparer[key] !== value)
  ) as Partial<T>;
}

/**
 * Gets the identity provider configuration for a kind.
 * @param kind - The kind of identity provider.
 * @returns The configuration, or undefined when there is none.
 */
export function findIdpConfig(kind: IdentityProviderKind): IdentityProvider | undefined {
  return useConfigStore().getConfig?.idpList?.find((x: IdentityProvider) => x.kind === kind);
}

/**
 * Shows an error as a toast message.
 * @param error - The error.
 * @param title - The toast title; the error message is used when omitted.
 * @param options - The toast message options.
 * @param toast - The toast instance, required when called outside of setup().
 */
export function generalErrorHandler(
  error: unknown,
  title?: string,
  options?: ToastMessageOptions,
  toast?: ReturnType<typeof useToast>
) {
  if (!toast) toast = useToast();
  if (isAxiosError(error) || error instanceof Error) {
    toast.error(title ?? error.message, title ? error.message : undefined, options);
  } else toast.error(title ?? String(error), title ? String(error) : undefined, options);
}

/**
 * Splits an array into consecutive batches of at most `size` items.
 * @param arr - The array to split.
 * @param size - The maximum number of items per batch.
 * @returns The batches in order, the last of which may be shorter.
 */
export function getBatches<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size));
}

/**
 * Categorizes a MIME type.
 * @param mimeType - The MIME type to categorize.
 * @returns The file category the MIME type falls under.
 */
export function getFileCategory(mimeType: string): string {
  // Checks for commonly used and likely used mimetypes
  switch (true) {
    case mimeType.includes('/vnd.shp'):
    case mimeType.includes('/vnd.shx'):
    case mimeType.includes('/dbase'):
    case mimeType.includes('/dbf'):
      return FileCategory.SHAPE;
    case mimeType.includes('/msword'):
    case mimeType.includes('/vnd.ms-word'):
    case mimeType.includes('/vnd.oasis.opendocument.text'):
    case mimeType.includes('/vnd.openxmlformats-officedocument.wordprocessingml'):
      return FileCategory.DOC;
    case mimeType.includes('/vnd.pdf'):
    case mimeType.includes('/pdf'):
    case mimeType.includes('/x-pdf'):
      return FileCategory.PDF;
    case mimeType.includes('/vnd.ms-excel'):
    case mimeType.includes('/vnd.openxmlformats-officedocument.spreadsheetml'):
    case mimeType.includes('/vnd.oasis.opendocument.spreadsheet'):
      return FileCategory.SPREADSHEET;
    case mimeType.includes('image/'):
      return FileCategory.IMAGE;
    case mimeType.includes('/vnd.seemail'):
    case mimeType.includes('/vnd.omads-email+xml'):
    case mimeType.includes('message/'):
      return FileCategory.EMAIL;
    case mimeType.includes('/gzip'):
    case mimeType.includes('/zip'):
    case mimeType.includes('/x-gzip'):
    case mimeType.includes('/x-zip'):
    case mimeType.includes('/x-7z'):
    case mimeType.includes('/x-rar'):
      return FileCategory.COMPRESSED;
    default:
      return FileCategory.FILE;
  }
}

/**
 * Separates a filename into its name and extension.
 * @param filename - The full filename.
 * @returns The name, and the extension when there is one.
 */
export function getFilenameAndExtension(filename: string): { filename: string; extension: string | undefined } {
  const extensionIdx = filename.lastIndexOf('.');
  if (extensionIdx > 0) {
    const name = filename.substring(0, extensionIdx);
    const ext = filename.split('.').pop();
    return { filename: name, extension: ext };
  } else {
    return { filename, extension: undefined };
  }
}

/**
 * Finds an element inside a container.
 * @param container - The container to search.
 * @param query - The selector for the element.
 * @param index - The index of the match to return; the last match is returned when omitted.
 * @returns The element, or null when there is no match or it is not an HTML element.
 */
export function getHTMLElement(container: HTMLElement, query: string, index?: number): HTMLElement | null {
  const elements = container.querySelectorAll(query);
  const length = elements.length;

  if (length === 0) return null;

  const element = index !== undefined ? elements[index] : elements[length - 1];

  return element instanceof HTMLElement ? element : null;
}

/**
 * Whether a raw input counts as not filled in: never set, cleared to null, or left empty.
 * @param value - The raw input.
 * @returns Whether the input is blank.
 */
export function isBlank(value: unknown) {
  return value === undefined || value === null || value === '';
}

/**
 * Whether the app is running in debug mode.
 * @returns Whether the app is in debug mode.
 */
export function isDebugMode(): boolean {
  return import.meta.env.MODE.toUpperCase() === 'DEBUG';
}

/**
 * Narrows a value to one that is neither null nor undefined.
 * @param value - The value to check.
 * @returns Whether the value is defined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Whether an object has no properties.
 * @param obj - The object to check.
 * @returns Whether the object is empty.
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Narrows an unknown value to one of a list of allowed values.
 * @param values - The allowed values.
 * @param value - The value to check.
 * @returns Whether the value is one of the allowed values.
 */
export function isOneOf<T>(values: readonly T[], value: unknown): value is T {
  return values.includes(value as T);
}

/**
 * Narrows a value to a plain object, rather than another type or a built-in object.
 * @param value - The value to check.
 * @returns Whether the value is a plain object.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}

/**
 * Whether a value means true: `true`, `1`, or a string such as "true", "yes" or "1".
 * @param value - The value to check.
 * @returns Whether the value means true, or undefined when the value is undefined.
 */
export function isTruthy(value: unknown) {
  if (value === undefined) return value;

  const isStr = typeof value === 'string' || value instanceof String;
  const trueStrings = ['true', 't', 'yes', 'y', '1'];
  return value === true || value === 1 || (isStr && trueStrings.includes(value.toLowerCase()));
}

/**
 * Joins path segments with the path delimiter, dropping empty segments.
 * @param items - The segments to join.
 * @returns The joined path.
 */
export function joinPath(...items: string[]): string {
  if (items && items.length) {
    const parts: string[] = [];
    items.forEach((p) => {
      if (p)
        p.split(DELIMITER).forEach((x) => {
          if (x && x.trim().length) parts.push(x);
        });
    });
    return parts.join(DELIMITER);
  } else return '';
}

/**
 * Copies an object without the given keys.
 * @param data - The object to copy.
 * @param keys - The keys to leave out.
 * @returns A new object without the given keys.
 */
export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
  const result = { ...data };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<Data, Keys>;
}

/**
 * Splits a delimited string into its trimmed values.
 * @param value - The string to split.
 * @param delimiter - The delimiter, a comma by default.
 * @returns The trimmed values.
 */
export function parseCSV(value: string, delimiter = ','): string[] {
  return value.split(`${delimiter}`).map((s) => s.trim());
}

/**
 * Splits an array into the items that pass a predicate and the items that fail it.
 * @see {@link https://stackoverflow.com/a/71247432}
 * @param arr - The array to split.
 * @param predicate - The predicate to test each item with.
 * @returns The passing items, then the failing items.
 */
export function partition<T>(arr: T[], predicate: (v: T, i: number, ar: T[]) => boolean): [T[], T[]] {
  return arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)]!.push(item);
      return acc;
    },
    [[], []] as [T[], T[]]
  );
}

/**
 * Scrolls to the topmost invalid field in a form.
 * @param errors - The error messages, keyed by field name.
 */
export function scrollToFirstError(errors: Record<string, string>) {
  let first: Element | null = null;

  for (const error of Object.keys(errors)) {
    const el = document.querySelector(`[name="${error}"]`);
    const rect = el?.getBoundingClientRect();

    if (rect) {
      if (!first) first = el;
      else if (rect.top < first.getBoundingClientRect().top) first = el;
    }
  }

  first?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Builds an RFC 6266 Content-Disposition header, adding RFC 8187 UTF-8 encoding when the filename needs it.
 * @param filename - The file name.
 * @returns The Content-Disposition header value.
 */
export function setDispositionHeader(filename: string) {
  const dispositionHeader = `attachment; filename="${filename}"`;
  const encodedFilename = encodeURIComponent(filename).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );

  if (filename === encodedFilename) {
    return dispositionHeader;
  } else {
    return dispositionHeader.concat(`; filename*=UTF-8''${encodedFilename}`);
  }
}

/**
 * Converts empty strings to null, recursively.
 * @param data - The value to convert.
 * @returns The value with empty strings converted.
 */
// Too much gets broken by trying to make this type safe
// Honestly we need to find a way to remove this function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setEmptyStringsToNull(data: any): any {
  if (data === '' || data === null) return null;

  if (Array.isArray(data)) {
    return data.map(setEmptyStringsToNull);
  }

  if (isPlainObject(data)) {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, setEmptyStringsToNull(v)]));
  }

  return data;
}

/**
 * Splits a Date into separate UTC date and time strings, with no time for a date at UTC midnight.
 * @param value - The date to split.
 * @returns The date and time strings, both null when the date is missing or invalid.
 */
export function splitDateTime(value?: Date | null): DateTimeStrings {
  if (!value || Number.isNaN(value.getTime())) {
    return { date: null, time: null };
  }

  const isDateOnly =
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0;

  const [date, time] = value.toISOString().split('T');

  if (isDateOnly) {
    return { date: date!, time: null };
  }

  return { date: date!, time: time! };
}

/**
 * Converts a date range to ISO strings, but only once both ends are picked.
 * @param range - The range, whose end is null while a range picker is half picked.
 * @returns The ISO strings, or undefined when the range is missing or incomplete.
 */
export function toIsoRange(range: (Date | null)[] | null | undefined) {
  return range?.length === 2 && range.every((date) => date instanceof Date)
    ? range.map((date) => date.toISOString())
    : undefined;
}

/**
 * Converts a string to kebab case.
 * @param input - The string to convert.
 * @returns The kebab case string.
 */
export function toKebabCase(input: string | undefined) {
  if (!input) return input;

  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 * @param str - The string to convert.
 * @returns The converted string.
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * Parses the leading integer from a string.
 * @param input - The string to parse.
 * @returns The integer, or undefined when the string does not start with one.
 */
export function toNumber(input: string): number | undefined {
  const i = Number.parseInt(input);
  return Number.isNaN(i) ? undefined : i;
}

/**
 * Keeps a value only when it is one of a list of allowed values, so a form asks again for anything else.
 * @param values - The allowed values.
 * @param value - The value to check.
 * @returns The value, or undefined when it is not allowed.
 */
export function toOneOf<T>(values: readonly T[], value: unknown): T | undefined {
  return isOneOf(values, value) ? value : undefined;
}

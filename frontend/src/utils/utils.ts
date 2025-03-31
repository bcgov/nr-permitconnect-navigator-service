import { toRaw, isRef, isReactive, isProxy } from 'vue';

import { useConfigStore } from '@/store';
import { DELIMITER } from '@/utils/constants/application';
import { FileCategory, IdentityProviderKind } from '@/utils/enums/application';

import type { IdentityProvider } from '@/types';

/**
 * @function deepToRaw
 * Recursively converts a Vue-created proxy object to a raw JSON object
 * @param {T} sourceObj Source object
 * @returns {T} Raw object from the given proxy sourceObj
 */
export function deepToRaw<T extends Record<string, any>>(sourceObj: T): T {
  const objectIterator = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map((item) => objectIterator(item));
    }
    if (isRef(input) || isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input));
    }
    if (input && typeof input === 'object') {
      return Object.keys(input).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(input[key]);
        return acc;
      }, {} as T);
    }
    return input;
  };

  return objectIterator(sourceObj);
}

/**
 * @function delimitEmails
 * Converts a space, semi-colon, or comma-separated value string into an array of string values
 * @param {string} value The string to parse
 * @returns {string[]} An array of string values
 */
export function delimitEmails(value: string): Array<string> {
  return value
    .split(/[\s;,]+/g)
    .map((s) => s.trim())
    .filter((s) => !!s);
}

/**
 * @function differential
 * Create a key/value differential from source against comparer
 * @param {object} source Source object
 * @param {object} comparer The object to be compared against
 * @returns {object} Object containing the non-matching key/value pairs in the source object
 */
export function differential(source: any, comparer: any): any {
  return Object.fromEntries(Object.entries(source).filter(([key, value]) => comparer[key] !== value));
}

/**
 * @function findIdpConfig
 * Get the identity provider configuration for the given kind
 * @param {IdentityProviderKind} kind The kind of identity provider
 * @returns {IdentityProvider | undefined} IDP config for the given kind or undefined if not found
 */
export function findIdpConfig(kind: IdentityProviderKind): IdentityProvider | undefined {
  return useConfigStore().getConfig?.idpList?.find((x: IdentityProvider) => x.kind === kind);
}

/**
 * @function getFileCategory
 * Compares mimeType to a list and returns a string category for that mimetype
 * @param {string} mimeType mimeType to be categorized
 * @returns {string} Category of file the mimeType falls under
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
 * @function getFilenameAndExtension
 * Separates a full filename into name and extension parts
 * @returns {filename: string, extension: string} An object containing filename and extension
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
 * @function getHTMLElement
 * Return element that is inside a given element/container
 * @param {HTMLElement} container contains element to be found
 * @param {string} query query used to find said element
 * @param {number} index index of element that is desired, if undefined get only/last element
 * @returns {HTMLElement | null} HTMLElement or null if no element/not an html element
 */
export function getHTMLElement(container: HTMLElement, query: string, index?: number): HTMLElement | null {
  const elements = container.querySelectorAll(query);
  const length = elements.length;

  if (length === 0) return null;

  const element = index !== undefined ? elements[index] : elements[length - 1];

  return element instanceof HTMLElement ? element : null;
}

/**
 * @function isDebugMode
 * Checks if the app is currently running in debug mode
 * @returns {boolean} True if in debug, false otherwise
 */
export function isDebugMode(): boolean {
  return import.meta.env.MODE.toUpperCase() === 'DEBUG';
}

/**
 * Checks whether the given object is empty, no properties
 *
 * @param {object} obj - The object to check.
 * @returns {boolean} True if the object is empty, false otherwise.
 */
export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * @function isTruthy
 * Returns true if the element name in the object contains a truthy value
 * @param {object} value The object to evaluate
 * @returns {boolean} True if truthy, false if not, and undefined if undefined
 */
export function isTruthy(value: unknown) {
  if (value === undefined) return value;

  const isStr = typeof value === 'string' || value instanceof String;
  const trueStrings = ['true', 't', 'yes', 'y', '1'];
  return value === true || value === 1 || (isStr && trueStrings.includes(value.toLowerCase()));
}

/**
 * @function joinPath
 * Joins a set of string arguments to yield a string path
 * @param  {...string} items The strings to join on
 * @returns {string} A path string with the specified delimiter
 */
export function joinPath(...items: Array<string>): string {
  if (items && items.length) {
    const parts: Array<string> = [];
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
 * @function omit
 * Omits the given set of keys from the given object
 * @param {object} data The object to copy and manipulate
 * @param {string[]} keys Array of keys to remove
 * @returns {object} A new object with the given keys removed
 */
export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
  const result = { ...data };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<Data, Keys>;
}

/**
 * @function parseCSV
 * Converts a comma separated value string into an array of string values
 * @param {string} value The CSV string to parse
 * @param {string} delimiter The optional string delimiter
 * @returns {string[]} An array of string values, or `value` if it is not a string
 */
export function parseCSV(value: string, delimiter: string = ','): Array<string> {
  return value.split(`${delimiter}`).map((s) => s.trim());
}

/**
 * @function partition
 * Partitions an array into two array sets depending on conditional
 * @see {@link https://stackoverflow.com/a/71247432}
 * @param {Array<T>} arr The array to partition
 * @param {Function} predicate The predicate function
 * @returns
 */
export function partition<T>(
  arr: Array<T>,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  predicate: (v: T, i: number, ar: Array<T>) => boolean
): [Array<T>, Array<T>] {
  return arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)].push(item);
      return acc;
    },
    [[], []] as [Array<T>, Array<T>]
  );
}

/**
 * @function setDispositionHeader
 * Constructs a valid RFC 6266 'Content-Disposition' header
 * and optionally handles RFC 8187 UTF-8 encoding when necessary
 * @param  {string} filename The file name to check if encoding is needed
 * @returns {string} The value for the key 'Content-Disposition'
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
 * @function setEmptyStringsToNull
 * Converts empty string values to null values
 * @param  {object} data The object to change
 * @returns {object} The object with the remapped values
 */
export function setEmptyStringsToNull(data: any) {
  Object.keys(data).forEach((key) => {
    const keyWithType = key as keyof typeof data;
    const value = data[keyWithType];
    if (typeof value === 'string' && value === '') {
      data = { ...data, [keyWithType]: null };
    }
  });

  return data;
}

/**
 * @function toKebabCase
 * Converts string values to kebab case
 * @param  {string} input The object to change
 * @returns {string} The object with the remapped values
 */
export function toKebabCase(input: string | undefined) {
  if (!input) return input;

  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * @function toNumber
 * Converts a string to number if possible
 * @param  {string} input The string to convert
 * @returns {number | undefined} The number if possible
 */
export function toNumber(input: string): number | undefined {
  const i = parseInt(input);
  return Number.isNaN(i) ? undefined : i;
}

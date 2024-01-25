import { DELIMITER, FILE_CATEGORIES } from '@/utils/constants';

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
      return FILE_CATEGORIES.SHAPE;
    case mimeType.includes('/msword'):
    case mimeType.includes('/vnd.ms-word'):
    case mimeType.includes('/vnd.oasis.opendocument.text'):
    case mimeType.includes('/vnd.openxmlformats-officedocument.wordprocessingml'):
      return FILE_CATEGORIES.DOC;
    case mimeType.includes('/vnd.pdf'):
    case mimeType.includes('/pdf'):
    case mimeType.includes('/x-pdf'):
      return FILE_CATEGORIES.PDF;
    case mimeType.includes('/vnd.ms-excel'):
    case mimeType.includes('/vnd.openxmlformats-officedocument.spreadsheetml'):
    case mimeType.includes('/vnd.oasis.opendocument.spreadsheet'):
      return FILE_CATEGORIES.SPREADSHEET;
    case mimeType.includes('image/'):
      return FILE_CATEGORIES.IMAGE;
    case mimeType.includes('/vnd.seemail'):
    case mimeType.includes('/vnd.omads-email+xml'):
    case mimeType.includes('message/'):
      return FILE_CATEGORIES.EMAIL;
    case mimeType.includes('/gzip'):
    case mimeType.includes('/zip'):
    case mimeType.includes('/x-gzip'):
    case mimeType.includes('/x-zip'):
    case mimeType.includes('/x-7z'):
    case mimeType.includes('/x-rar'):
      return FILE_CATEGORIES.COMPRESSED;
    default:
      return FILE_CATEGORIES.FILE;
  }
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

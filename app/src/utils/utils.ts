import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { validate, version } from 'uuid';

import { getLogger } from '../utils/log.ts';

import type {
  ChefsFormConfig,
  ChefsFormConfigData,
  CurrentContext,
  IdpAttributes,
  DateTimeStrings
} from '../types/index.ts';

const log = getLogger(module.filename);

/**
 * Yields a lowercase uuid `str` that has dashes inserted, or `str` if not a string.
 * @param str The input string uuid
 * @returns The string `str` but with dashes inserted, or `str` if not a string.
 */
export function addDashesToUuid(str: string): string {
  if (str.length === 32) {
    return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(
      20
    )}`.toLowerCase();
  } else return str;
}

/**
 * Converts a CamelCase string to title case that can handle camel case
 * @param input The string to convert
 * @returns A string in title case
 */
export function camelCaseToTitleCase(input: string | null): string | null {
  if (!input) return input;

  const result = input.replace(/([A-Z])/g, ' $1');
  return (result.charAt(0).toUpperCase() + result.slice(1)).trim();
}

/**
 * Combines separate date and time strings into a single UTC Date object
 * @param date date string
 * @param time time string
 * @returns A constructed date object
 */
export const combineDateTime = (date?: string | null, time?: string | null): Date | undefined => {
  if (!date) return undefined;

  if (!time) {
    return new Date(`${date}T00:00:00.000Z`);
  }

  return new Date(`${date}T${time}`);
};

/**
 * Date comparator function
 * Defaults to ascending order: oldest to newest
 * Undefined dates are treated as oldest, or newest if desc=true
 * @param a Optional first date to compare
 * @param b Optional second date to compare
 * @param desc If true, sorts in descending order: newest to oldest
 * @returns A negative number if a before b, positive if a after b, or 0 if equal (reversed if desc=true)
 */
export function compareDates(a?: Date, b?: Date, desc = false): number {
  const direction = desc ? -1 : 1;

  // Both dates undefined
  if (!a && !b) return 0;

  // One date undefined
  if (!a) return -1 * direction;
  if (!b) return 1 * direction;

  // Both dates defined
  return (a.getTime() - b.getTime()) * direction;
}

/**
 * Search for a CHEFS form Api Key
 * @param formId The CHEFS form ID
 * @returns The CHEFS form Api Key if it exists
 */
export function getChefsApiKey(formId: string): string | undefined {
  const cfg: ChefsFormConfig = config.get('server.chefs.forms');
  return Object.values<ChefsFormConfigData>(cfg).find((o: ChefsFormConfigData) => o.id === formId)?.apiKey;
}

/**
 * Formats a YYYY-MM-DD date-only string into "MMMM D, YYYY"
 * @param value A date only string
 * @returns A string representation of `value`
 */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return '';

  // Must be exactly YYYY-MM-DD
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return '';

  const [, year, month, day] = match;
  const monthNumber = Number(month) - 1;

  if (monthNumber > 11 || monthNumber < 0) return '';

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date().setMonth(monthNumber));
  const dayNum = String(Number(day));

  return `${monthName} ${dayNum}, ${year}`;
}

/**
 * Gets the current git revision hash
 * @see {@link https://stackoverflow.com/a/34518749}
 * @returns The git revision hash, or empty string
 */
export function getGitRevision(): string {
  try {
    const gitDir = (() => {
      let dir = '.git',
        i = 0;
      while (!existsSync(join(__dirname, dir)) && i < 5) {
        dir = '../' + dir;
        i++;
      }
      return dir;
    })();

    const head = readFileSync(join(__dirname, `${gitDir}/HEAD`), 'utf8')
      .toString()
      .trim();

    if (head.includes(':')) {
      return head;
    } else {
      return readFileSync(join(__dirname, `${gitDir}/${head.substring(5)}`), 'utf8')
        .toString()
        .trim();
    }
  } catch (err) {
    log.warn(err);
    return '';
  }
}

/**
 * Attempts to acquire a specific current token sub. Yields `defaultValue` otherwise
 * @param currentContext The express request currentContext object
 * @param defaultValue An optional default return value
 * @returns The requested current token sub if applicable, or `defaultValue`
 */
export function getCurrentSubject(currentContext: CurrentContext | undefined, defaultValue = ''): string {
  return currentContext?.tokenPayload?.sub ?? defaultValue;
}

/**
 * Parses currentContext object's identity provider to return their username
 * @param currentContext The express request CurrentContext object
 * @returns The username in currentUser or undefined
 */
export function getCurrentUsername(currentContext: CurrentContext | undefined): string | undefined {
  if (currentContext?.tokenPayload) {
    const idpList = readIdpList();
    const payload = currentContext.tokenPayload;

    const usernameKey = idpList.find((x) => x.idp === payload.identity_provider)?.username;

    if (usernameKey && usernameKey in payload) return payload[usernameKey] as string;
  }

  return undefined;
}

/**
 * Returns true if the element name in the object contains a truthy value
 * @param value The object to evaluate
 * @returns True if truthy, false if not, and undefined if undefined
 */
export function isTruthy(value: unknown): boolean | undefined {
  if (value === undefined) return value;

  const isStr = typeof value === 'string' || value instanceof String;
  const trueStrings = ['true', 't', 'yes', 'y', '1'];
  return value === true || value === 1 || (isStr && trueStrings.includes(value.toLowerCase()));
}

/**
 * Standardizes query params to yield an array of unique string values
 * @param param The query param to process
 * @returns A unique, non-empty array of string values, or undefined if empty
 */
export function mixedQueryToArray(param: string | string[] | undefined): string[] | undefined {
  // Short circuit undefined if param is falsy
  if (!param) return undefined;

  const parsed = Array.isArray(param) ? param.flatMap((p) => parseCSV(p)) : parseCSV(param);
  const unique = Array.from(new Set(parsed));

  return unique.length ? unique : undefined;
}

/**
 * Omits the given set of keys from the given object
 * @param data The object to copy and manipulate
 * @param keys Array of keys to remove
 * @returns A new object with the given keys removed
 */
export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
  const result = { ...data };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<Data, Keys>;
}

/**
 * Converts a comma separated value string into an array of string values
 * @param value The CSV string to parse
 * @returns An array of string values, or `value` if it is not a string
 */
export function parseCSV(value: string): string[] {
  return value.split(',').map((s) => s.trim());
}

/**
 * Partitions an array into two array sets depending on conditional
 * @see {@link https://stackoverflow.com/a/71247432}
 * @param arr The array to partition
 * @param predicate The predicate function
 * @returns The partitioned arrays
 */
export function partition<T>(arr: T[], predicate: (v: T, i: number, ar: T[]) => boolean): [T[], T[]] {
  return arr.reduce(
    (acc, item, index, array) => {
      acc[+!predicate(item, index, array)].push(item);
      return acc;
    },
    [[], []] as [T[], T[]]
  );
}

/**
 * Returns an array of strings representing potential identity key claims
 * Array will always end with the last value as 'sub'
 * @returns An array of string values, or `value` if it is not a string
 */
export function parseIdentityKeyClaims(): string[] {
  const claims: string[] = [];
  if (config.has('server.oidc.identityKey')) {
    claims.push(...parseCSV(config.get('server.oidc.identityKey')));
  }
  return claims.concat('sub');
}

/**
 * Acquires the list of feature flags to be used
 * @returns A promise resolving to an object of key values
 */
export function readFeatureList(): Record<string, boolean> {
  const configDir = '../../config';
  const env: string = config.get('server.env');
  const defaultFile = `features-${env}.json`;
  const overrideFile = 'features-local.json';

  let features: Record<string, boolean> = {};

  if (existsSync(join(__dirname, configDir, overrideFile))) {
    features = JSON.parse(readFileSync(join(__dirname, configDir, overrideFile), 'utf8')) as Record<string, boolean>;
  } else if (existsSync(join(__dirname, configDir, defaultFile))) {
    features = JSON.parse(readFileSync(join(__dirname, configDir, defaultFile), 'utf8')) as Record<string, boolean>;
  }

  return features;
}

/**
 * Acquires the list of identity providers to be used
 * @returns A promise resolving to an array of idp provider objects
 */
export function readIdpList(): IdpAttributes[] {
  const configDir = '../../config';
  const defaultFile = 'idplist-default.json';
  const overrideFile = 'idplist-local.json';

  let idpList: IdpAttributes[] = [];

  if (existsSync(join(__dirname, configDir, overrideFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, overrideFile), 'utf8')) as IdpAttributes[];
  } else if (existsSync(join(__dirname, configDir, defaultFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, defaultFile), 'utf8')) as IdpAttributes[];
  }

  return idpList;
}

/**
 * Sanitizes objects by replacing sensitive data with a REDACTED string value
 * @param data An arbitrary object
 * @param fields An array of field strings to sanitize on
 * @returns An arbitrary object with specified secret fields marked as redacted
 */
export function redactSecrets(data: Record<string, unknown>, fields: string[]): unknown {
  if (fields && Array.isArray(fields) && fields.length) {
    fields.forEach((field) => {
      if (data[field]) data[field] = 'REDACTED';
    });
  }
  return data;
}

/**
 * Splits a single Date object into separate UTC date and time strings
 * @param value The Date instance to split
 * @returns An object containing `date` and `time` strings
 */
export function splitDateTime(value: Date): DateTimeStrings {
  const isDateOnly =
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0;

  const [date, time] = value.toISOString().split('T');

  if (isDateOnly) return { date, time: null };

  return { date, time };
}

/**
 * Converts a string to title case
 * @param str The string to convert
 * @returns The input string converted to title case
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * Converts a UUDI to an activity ID
 * @param id The ID to convert
 * @returns A truncated version of the given ID
 */
export function uuidToActivityId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

/**
 * Validates a UUID and checks if it is version 4
 * @param uuid The UUID to validate
 * @returns True if the UUID is valid and is version 4
 */
export function uuidValidateV4(uuid: string): boolean {
  return validate(uuid) && version(uuid) === 4;
}

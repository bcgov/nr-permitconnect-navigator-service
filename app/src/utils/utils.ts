import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { validate, version } from 'uuid';

import { getLogger } from '../components/log';
import type { JwtPayload } from 'jsonwebtoken';
import type { ChefsFormConfig, ChefsFormConfigData, CurrentContext, IdpAttributes } from '../types';

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
 * @param str The string to convert
 * @returns A string in title case
 */
export function camelCaseToTitleCase(input: string | null): string | null {
  if (!input) return input;

  const result = input.replace(/([A-Z])/g, ' $1');
  return (result.charAt(0).toUpperCase() + result.slice(1)).trim();
}

/**
 * Comparator function for sorting dates
 * Defaults to ascending order: oldest to newest
 * @param a Optional first date to compare
 * @param b Optional second date to compare
 * @param desc If true, sorts in descending order: newest to oldest
 * @returns A negative number if a before b, positive if a after b, or 0 if equal
 */
export function compareDates(a?: Date, b?: Date, desc = false): number {
  const timeA = a?.getTime() ?? -Infinity;
  const timeB = b?.getTime() ?? -Infinity;

  return desc ? timeB - timeA : timeA - timeB;
}

/**
 * Search for a CHEFS form Api Key
 * @returns The CHEFS form Api Key if it exists
 */
export function getChefsApiKey(formId: string): string | undefined {
  const cfg = config.get('server.chefs.forms') as ChefsFormConfig;
  return Object.values<ChefsFormConfigData>(cfg).find((o: ChefsFormConfigData) => o.id === formId)?.apiKey;
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

    if (head.indexOf(':') === -1) {
      return head;
    } else {
      return readFileSync(join(__dirname, `${gitDir}/${head.substring(5)}`), 'utf8')
        .toString()
        .trim();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    log.warn(err.message, { function: 'getGitRevision' });
    return '';
  }
}

/**
 * Attempts to acquire a specific current token sub. Yields `defaultValue` otherwise
 * @param currentContext The express request currentContext object
 * @param [defaultValue=''] An optional default return value
 * @returns The requested current token sub if applicable, or `defaultValue`
 */
export function getCurrentSubject(currentContext: CurrentContext | undefined, defaultValue: string = ''): string {
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
    const payload = currentContext.tokenPayload as JwtPayload;

    const usernameKey = idpList.find((x) => x.idp === payload.identity_provider)?.username;

    if (usernameKey && usernameKey in payload) return payload[usernameKey];
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
 * @returns
 */
export function partition<T>(
  arr: T[],
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  predicate: (v: T, i: number, ar: T[]) => boolean
): [T[], T[]] {
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
export function readFeatureList(): { [key: string]: unknown } {
  const configDir = '../../config';
  const defaultFile = 'features-default.json';
  const overrideFile = 'features-local.json';

  let features;

  if (existsSync(join(__dirname, configDir, overrideFile))) {
    features = JSON.parse(readFileSync(join(__dirname, configDir, overrideFile), 'utf8'));
  } else if (existsSync(join(__dirname, configDir, defaultFile))) {
    features = JSON.parse(readFileSync(join(__dirname, configDir, defaultFile), 'utf8'));
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

  let idpList = [];

  if (existsSync(join(__dirname, configDir, overrideFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, overrideFile), 'utf8'));
  } else if (existsSync(join(__dirname, configDir, defaultFile))) {
    idpList = JSON.parse(readFileSync(join(__dirname, configDir, defaultFile), 'utf8'));
  }

  return idpList;
}

/**
 * Sanitizes objects by replacing sensitive data with a REDACTED string value
 * @param data An arbitrary object
 * @param fields An array of field strings to sanitize on
 * @returns An arbitrary object with specified secret fields marked as redacted
 */
export function redactSecrets(data: { [key: string]: unknown }, fields: string[]): unknown {
  if (fields && Array.isArray(fields) && fields.length) {
    fields.forEach((field) => {
      if (data[field]) data[field] = 'REDACTED';
    });
  }
  return data;
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

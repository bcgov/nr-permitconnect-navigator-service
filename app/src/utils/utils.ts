import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { getLogger } from '../components/log';
import type { JwtPayload } from 'jsonwebtoken';
import type { ChefsFormConfig, ChefsFormConfigData, CurrentContext, IdpAttributes } from '../types';

const log = getLogger(module.filename);

/**
 * @function camelCaseToTitleCase
 * Converts a string to title case that can handle camel case
 * @param {string | null} str The string to convert
 * @returns {string | null} A string in title case
 */
export function camelCaseToTitleCase(input: string | null): string | null {
  if (!input) return input;

  const result = input.replace(/([A-Z])/g, ' $1');
  return (result.charAt(0).toUpperCase() + result.slice(1)).trim();
}

/**
 * @function deDupeUnsure
 * Checks if input string is 'unsureunsure' and returns it deduplicated
 * Otherwise returns input
 * @param {string} str The input string
 * @returns {string} Deduplicated input or the input itself
 */
export function deDupeUnsure(str: string | null): string | null {
  if (str === 'unsureunsure') {
    return 'unsure';
  } else return str;
}

/**
 * @function addDashesToUuid
 * Yields a lowercase uuid `str` that has dashes inserted, or `str` if not a string.
 * @param {string} str The input string uuid
 * @returns {string} The string `str` but with dashes inserted, or `str` if not a string.
 */
export function addDashesToUuid(str: string): string {
  if (str.length === 32) {
    return `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(
      20
    )}`.toLowerCase();
  } else return str;
}

/**
 * @function getChefsApiKey
 * Search for a CHEFS form Api Key
 * @returns {string | undefined} The CHEFS form Api Key if it exists
 */
export function getChefsApiKey(formId: string): string | undefined {
  const cfg = config.get('server.chefs.forms') as ChefsFormConfig;
  return Object.values<ChefsFormConfigData>(cfg).find((o: ChefsFormConfigData) => o.id === formId)?.apiKey;
}

/**
 * @function getGitRevision
 * Gets the current git revision hash
 * @see {@link https://stackoverflow.com/a/34518749}
 * @returns {string} The git revision hash, or empty string
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
 * @function getCurrentSubject
 * Attempts to acquire a specific current token sub. Yields `defaultValue` otherwise
 * @param {object} currentContext The express request currentContext object
 * @param {string} [defaultValue=''] An optional default return value
 * @returns {object} The requested current token sub if applicable, or `defaultValue`
 */
export function getCurrentSubject(currentContext: CurrentContext | undefined, defaultValue: string = '') {
  return currentContext?.tokenPayload?.sub ?? defaultValue;
}

/**
 * @function getCurrentUsername
 * Parses currentContext object's identity provider to return their username
 * @param {object} currentContext The express request CurrentContext object
 * @returns {string | undefined} The username in currentUser or undefined
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
 * @function mixedQueryToArray
 * Standardizes query params to yield an array of unique string values
 * @param {string|string[]} param The query param to process
 * @returns {string[]} A unique, non-empty array of string values, or undefined if empty
 */
export function mixedQueryToArray(param: string | Array<string>): Array<string> | undefined {
  // Short circuit undefined if param is falsy
  if (!param) return undefined;

  const parsed = Array.isArray(param) ? param.flatMap((p) => parseCSV(p)) : parseCSV(param);
  const unique = Array.from(new Set(parsed));

  return unique.length ? unique : undefined;
}

/**
 * @function parseCSV
 * Converts a comma separated value string into an array of string values
 * @param {string} value The CSV string to parse
 * @returns {string[]} An array of string values, or `value` if it is not a string
 */
export function parseCSV(value: string): Array<string> {
  return value.split(',').map((s) => s.trim());
}

/**
 * @function parseIdentityKeyClaims
 * Returns an array of strings representing potential identity key claims
 * Array will always end with the last value as 'sub'
 * @returns {string[]} An array of string values, or `value` if it is not a string
 */
export function parseIdentityKeyClaims(): Array<string> {
  const claims: Array<string> = [];
  if (config.has('server.oidc.identityKey')) {
    claims.push(...parseCSV(config.get('server.oidc.identityKey')));
  }
  return claims.concat('sub');
}

/**
 * @function readIdpList
 * Acquires the list of identity providers to be used
 * @returns {object[]} A promise resolving to an array of idp provider objects
 */
export function readIdpList(): Array<IdpAttributes> {
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
 * @function redactSecrets
 * Sanitizes objects by replacing sensitive data with a REDACTED string value
 * @param {object} data An arbitrary object
 * @param {string[]} fields An array of field strings to sanitize on
 * @returns {object} An arbitrary object with specified secret fields marked as redacted
 */
export function redactSecrets(data: { [key: string]: unknown }, fields: Array<string>): unknown {
  if (fields && Array.isArray(fields) && fields.length) {
    fields.forEach((field) => {
      if (data[field]) data[field] = 'REDACTED';
    });
  }
  return data;
}

/**
 * @function toTitleCase
 * Converts a string to title case
 * @param {string} str The string to convert
 * @returns {object} An arbitrary object with specified secret fields marked as redacted
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

/**
 * @function uuidToActivityId
 * Converts a UUDI to an activity ID
 * @param {string} id The ID to convert
 * @returns {string} A truncated version of the given ID
 */
export function uuidToActivityId(id: string): string {
  return id.substring(0, 8).toUpperCase();
}

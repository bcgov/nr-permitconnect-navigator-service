import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { AuthType } from './constants';
import { getLogger } from './log';

import type { JwtPayload } from 'jsonwebtoken';
import type { ChefsFormConfig, ChefsFormConfigData, CurrentUser } from '../types';

const log = getLogger(module.filename);

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
 * @function getCurrentIdentity
 * Attempts to acquire current identity value.
 * Always takes first non-default value available. Yields `defaultValue` otherwise.
 * @param {object} currentUser The express request currentUser object
 * @param {string} [defaultValue=undefined] An optional default return value
 * @returns {string} The current user identifier if applicable, or `defaultValue`
 */
export function getCurrentIdentity(currentUser: CurrentUser | undefined, defaultValue: string | undefined = undefined) {
  return parseIdentityKeyClaims()
    .map((claim) => getCurrentTokenClaim(currentUser, claim, undefined))
    .filter((value) => value) // Drop falsy values from array
    .concat(defaultValue)[0]; // Add defaultValue as last element of array
}

/**
 * @function getCurrentTokenClaim
 * Attempts to acquire a specific current token claim. Yields `defaultValue` otherwise
 * @param {object} currentUser The express request currentUser object
 * @param {string} claim The requested token claim
 * @param {string} [defaultValue=undefined] An optional default return value
 * @returns {object} The requested current token claim if applicable, or `defaultValue`
 */
export function getCurrentTokenClaim(
  currentUser: CurrentUser | undefined,
  claim: string,
  defaultValue: string | undefined = undefined
) {
  return currentUser && currentUser.authType === AuthType.BEARER
    ? (currentUser.tokenPayload as JwtPayload)[claim]
    : defaultValue;
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
export function readIdpList(): object[] {
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
  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
}

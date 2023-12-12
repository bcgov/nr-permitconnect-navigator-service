import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { getLogger } from './log';
import { ChefsFormConfig, ChefsFormConfigData } from '../types/ChefsFormConfig';
const log = getLogger(module.filename);

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
 * @function fromYrn
 * Converts a YRN string to boolean
 * @param {string | null | undefined} yrn An arbitrary string
 * @returns {boolean | null} The converted value
 */
export function fromYrn(yrn: string | null | undefined): boolean | null {
  if (!yrn) return null;
  return yrn.toUpperCase() === 'Y' ? true : false;
}

/**
 * @function toYrn
 * Converts a boolean value to a YRN string
 * @param {boolean | null | undefined} bool An arbitrary boolean
 * @returns {sring | null} The converted value
 */
export function toYrn(bool: boolean | null | undefined): string | null {
  if (bool === null || bool === undefined) return null;
  return bool ? 'Y' : 'N';
}

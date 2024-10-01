import { format, parseJSON } from 'date-fns';

import { useConfigStore } from '@/store';

function _dateFnsFormat(value: string | undefined | null, formatter: string) {
  const formatted = '';
  try {
    if (value) {
      return format(parseJSON(value), formatter);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`_dateFnsFormat: Error parsing ${value} to ${error}`);
  }
  return formatted;
}

/**
 * @function formatDate
 * Converts a date to an 'MMMM D YYYY' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDate(value: string | undefined | null) {
  return value ? _dateFnsFormat(value, 'MMMM d yyyy') : '';
}

/**
 * @function formatDateShort
 * Converts a date to an 'YYYY MMM dd, HH:mm' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateShort(value: string | undefined | null) {
  return _dateFnsFormat(value, 'yyyy MMM dd, HH:mm');
}

/**
 * @function formatDateLong
 * Converts a date to an 'MMMM D yyyy, h:mm:ss a' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateLong(value: string | undefined | null) {
  return _dateFnsFormat(value, 'MMMM d yyyy, h:mm:ss a');
}

/**
 * @function formatDateTime
 * Converts a date to an 'MMMM D yyyy, h:mm a' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateTime(value: string | undefined | null) {
  return _dateFnsFormat(value, 'MMMM d yyyy, h:mm a');
}

/**
 * @function formatJwtUsername
 * Formats a JWT username to a presentable value
 * @param {String} value A string representation of a JWT username
 * @returns {String} A formatted representation of `value`
 */
export function formatJwtUsername(value: string | undefined | null) {
  if (!value) return undefined;

  const idps = useConfigStore().getConfig.idpList;
  value = value.toUpperCase();

  let substr = value.length;
  for (const idp of idps) {
    const i = value.indexOf(`@${idp.idp.toUpperCase()}`);
    if (i !== -1) {
      substr = i;
      break;
    }
  }
  return value.substring(0, substr);
}

export function toKebabCase(str: string | undefined | null) {
  const strs = str && str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);
  return strs ? strs.join('-').toLocaleLowerCase() : '';
}

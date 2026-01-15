import { format, parseJSON } from 'date-fns';

import { useConfigStore } from '@/store';

function _dateFnsFormat(value: string | undefined | null, formatter: string) {
  const formatted = '';
  try {
    if (value) {
      return format(parseJSON(value), formatter);
    }
  } catch (error) {
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
  return value ? _dateFnsFormat(value, 'MMMM d, yyyy') : '';
}

/**
 * @function formatDateFilename
 * Converts a date to a filename-friendly formatted string: 'YYYY-MM-DD_HHMMSS'
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateFilename(value: string | undefined | null) {
  return _dateFnsFormat(value, 'yyyy-MM-dd_HHmm');
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
 * @function formatDateOnly
 * Formats a YYYY-MM-DD date-only string into "MMMM D, YYYY"
 * @param value A date only string
 * @returns {String} A string representation of `value`
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
 * @function formatDateShort
 * Converts a date to an 'YYYY MMM dd, HH:mm' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateShort(value: string | undefined | null) {
  return _dateFnsFormat(value, 'yyyy MMM dd, HH:mm');
}

/**
 * @function formatDateTime
 * Converts a date to an 'MMMM D yyyy, h:mm a' formatted string
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatDateTime(value: string | undefined | null) {
  return _dateFnsFormat(value, 'MMMM d, yyyy, h:mm a');
}

/**
 * @deprecated Function not used anywhere
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

/**
 * @function formatTime
 * Converts a date to a filename-friendly formatted string: 'HH:mm'
 * @param {String} value A string representation of a date
 * @returns {String} A string representation of `value`
 */
export function formatTime(value: string | undefined | null) {
  return _dateFnsFormat(value, 'hh:mm a');
}

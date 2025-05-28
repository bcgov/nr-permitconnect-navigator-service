// Inspired by https://github.com/ahmadnassri/node-api-problem
import { STATUS_CODES } from 'node:http';

import type { Request, Response } from 'express';

const CONTENT_TYPE = 'application/problem+json';
const DEFAULT_TYPE = 'about:blank';
const ERR_STATUS = '"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)';
const ERR_TITLE = 'missing "title". a short, human-readable summary of the problem type';
const STATUS_CODES_WEB = 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/';

/**
 * A Problem Details object error generator which extends the `Error` class.
 * This class is used to model HTTP problem details as per RFC9457.
 * @see https://tools.ietf.org/html/rfc9457
 */
export default class Problem extends Error {
  /** The type of the problem, typically a URI reference identifying the problem type. */
  type: string;

  /** A short, human-readable summary of the problem. */
  title: string;

  /** The HTTP status code associated with the problem. */
  status: number;

  /** (Optional) A detailed explanation of the problem. */
  detail?: string;

  /** (Optional) A URI reference that identifies the specific occurrence of the problem. */
  instance?: string;

  /**
   * Constructs a new `Problem` instance.
   * @param status - The HTTP status code of the problem (RFC7231, Section 6).
   * @param opts - Optional parameters for the problem details.
   * @param opts.type - The type of the problem. Defaults to a URI based on the status code.
   * @param opts.title - A short, human-readable summary of the problem. Defaults to the status code description.
   * @param opts.detail - A detailed explanation of the problem.
   * @param opts.instance - A URI reference identifying the specific occurrence of the problem.
   * @param extra - Additional properties to be assigned to the problem object.
   * @throws {Error} If the `status` is not provided or is invalid.
   * @throws {Error} If the `title` cannot be determined.
   */
  constructor(
    status: number,
    opts?: {
      type?: string;
      title?: string;
      detail?: string;
      instance?: string;
    },
    extra?: unknown
  ) {
    if (!status) throw new Error(ERR_STATUS);
    if ((status >= 600 || status < 400) && status !== 207) {
      throw new Error(ERR_STATUS);
    }

    let type = opts?.type ?? DEFAULT_TYPE;
    if (type === DEFAULT_TYPE) {
      type = STATUS_CODES_WEB + status;
    }

    let title = opts?.title;
    if (!opts?.title && Object.prototype.hasOwnProperty.call(STATUS_CODES, status)) {
      title = STATUS_CODES[status];
    }
    if (!title) throw new Error(ERR_TITLE);

    super(`[${status}] ${title} (${type})`);
    this.type = type;
    this.title = title;
    this.status = status;
    this.detail = opts?.detail;
    this.instance = opts?.instance ?? undefined;

    if (extra) Object.assign(this, extra);
  }

  /**
   * Converts the `Problem` instance to a string representation.
   * @returns A string in the format `[status] title (type)`.
   */
  toString() {
    return `[${this.status}] ${this.title} (${this.type})`;
  }

  /**
   * Converts the `Problem` instance to a plain object representation.
   * This method escapes the `Error` class to ensure all properties are included.
   * @returns An object containing all properties of the `Problem` instance.
   */
  toObject() {
    // Escape the Error class
    return Object.fromEntries(new Map(Object.entries(this)));
  }

  /**
   * Sends a JSON response with the current instance's data.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @param space - The number of spaces to use for JSON stringification. Defaults to 2.
   */

  send(req: Request, res: Response, space: string | number = 2) {
    this.instance ??= req.originalUrl;
    res.writeHead(this.status, { 'Content-Type': CONTENT_TYPE });
    res.end(JSON.stringify(this, null, space));
  }
}

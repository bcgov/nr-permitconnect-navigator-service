import Problem from '../../../src/utils/problem.ts';

import type { Request, Response } from 'express';

describe('Problem', () => {
  it('should create a Problem instance with valid inputs', () => {
    const problem = new Problem(404, {
      title: 'Not Found',
      detail: 'Resource not found'
    });
    expect(problem.status).toBe(404);
    expect(problem.title).toBe('Not Found');
    expect(problem.detail).toBe('Resource not found');
    expect(problem.type).toBe('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404');
  });

  it('should throw an error if status is garbage', () => {
    expect(() => new Problem(0)).toThrow('"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)');
  });

  it('should throw an error if status is invalid', () => {
    expect(() => new Problem(200)).toThrow('"status" must be a valid HTTP Error Status Code ([RFC7231], Section 6)');
  });

  it('should throw an error if title is missing and cannot be determined', () => {
    expect(() => new Problem(499)).toThrow('missing "title". a short, human-readable summary of the problem type');
  });

  it('should default to a standard title when not custom defined', () => {
    const problem = new Problem(422);

    expect(problem.status).toBe(422);
    expect(problem.title).toBe('Unprocessable Entity');
    expect(problem.detail).toBeUndefined();
    expect(problem.type).toBe('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422');
  });

  it('should default type to about:blank if not provided', () => {
    const problem = new Problem(404, { title: 'Not Found' });

    expect(problem.status).toBe(404);
    expect(problem.title).toBe('Not Found');
    expect(problem.detail).toBeUndefined();
    expect(problem.type).toBe('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404');
  });

  it('should include extra properties if provided', () => {
    const problem = new Problem(400, { title: 'Bad Request' }, { custom: 'extra' });

    expect(problem.status).toBe(400);
    expect(problem.title).toBe('Bad Request');
    expect(problem.detail).toBeUndefined();
    expect(problem.type).toBe('https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400');
    // @ts-expect-error ts(2339)
    expect(problem.custom).toBe('extra');
  });

  describe('toString', () => {
    it('should convert to string correctly', () => {
      const problem = new Problem(500, { title: 'Internal Server Error' });
      expect(problem.toString()).toBe(
        '[500] Internal Server Error (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500)'
      );
    });
  });

  describe('toObject', () => {
    it('should convert to object correctly', () => {
      const problem = new Problem(403, {
        title: 'Forbidden',
        detail: 'Access denied'
      });

      const obj = problem.toObject();

      expect(obj.status).toBe(403);
      expect(obj.title).toBe('Forbidden');
      expect(obj.detail).toBe('Access denied');
    });
  });

  describe('send', () => {
    it('should send a JSON response with the problem details', () => {
      const req = { originalUrl: '/test' } as Request;
      const res = {
        writeHead: jest.fn(),
        end: jest.fn()
      } as unknown as Response;

      const problem = new Problem(401, { title: 'Unauthorized' });
      problem.send(req, res);

      expect(res.writeHead).toHaveBeenCalledTimes(1);
      expect(res.writeHead).toHaveBeenCalledWith(401, {
        'Content-Type': 'application/problem+json'
      });
      expect(res.end).toHaveBeenCalledTimes(1);
      expect(res.end).toHaveBeenCalledWith(
        JSON.stringify(
          {
            type: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401',
            title: 'Unauthorized',
            status: 401,
            detail: undefined,
            instance: '/test'
          },
          null,
          2
        )
      );
    });
  });
});

import { prismaTxMock } from '../../__mocks__/prismaMock';

import * as documentService from '../../../src/services/document';

import { generateCreateStamps } from '../../../src/db/utils/utils';
import { TEST_CURRENT_CONTEXT } from '../data';

import type { Document } from '../../../src/types';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('createDocument', () => {
  it('calls document.create and returns result', async () => {
    prismaTxMock.document.create.mockResolvedValueOnce({ documentId: '1' } as Document);

    const response = await documentService.createDocument(
      prismaTxMock,
      '1',
      'ACT',
      'FILE.txt',
      'MIME',
      12345,
      generateCreateStamps(TEST_CURRENT_CONTEXT)
    );

    expect(prismaTxMock.document.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.document.create).toHaveBeenCalledWith({
      data: {
        documentId: '1',
        activityId: 'ACT',
        filename: 'FILE.txt',
        mimeType: 'MIME',
        filesize: 12345,
        createdAt: expect.any(Date),
        createdBy: TEST_CURRENT_CONTEXT.userId
      }
    });
    expect(response).toStrictEqual({ documentId: '1' });
  });
});

describe('deleteDocument', () => {
  it('calls document.delete', async () => {
    prismaTxMock.document.delete.mockResolvedValueOnce({} as Document);

    await documentService.deleteDocument(prismaTxMock, '1');

    expect(prismaTxMock.document.delete).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.document.delete).toHaveBeenCalledWith({ where: { documentId: '1' } });
  });
});

describe('getDocument', () => {
  it('calls document.findFirstOrThrow and returns result', async () => {
    prismaTxMock.document.findFirstOrThrow.mockResolvedValueOnce({ documentId: '1' } as Document);

    const response = await documentService.getDocument(prismaTxMock, '1');

    expect(prismaTxMock.document.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.document.findFirstOrThrow).toHaveBeenCalledWith({ where: { documentId: '1' } });
    expect(response).toStrictEqual({ documentId: '1' });
  });
});

describe('listDocuments', () => {
  it('calls document.findMany and returns result', async () => {
    prismaTxMock.document.findMany.mockResolvedValueOnce([{ documentId: '1' }] as Document[]);

    const response = await documentService.listDocuments(prismaTxMock, '1');

    expect(prismaTxMock.document.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.document.findMany).toHaveBeenCalledWith({
      where: {
        activityId: '1'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    expect(response).toStrictEqual([{ documentId: '1' }]);
  });
});

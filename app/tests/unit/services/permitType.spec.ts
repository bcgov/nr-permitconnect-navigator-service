import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { listPermitTypes } from '../../../src/services/permitType.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { TEST_PERMIT_TYPE_LIST } from '../data/index.ts';

describe('listPermitTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns permit types from prisma', async () => {
    prismaTxMock.permit_type.findMany.mockResolvedValueOnce(TEST_PERMIT_TYPE_LIST);

    const result = await listPermitTypes(prismaTxMock, Initiative.HOUSING);

    expect(result).toEqual(TEST_PERMIT_TYPE_LIST);
  });

  it('queries by initiative when one is provided', async () => {
    prismaTxMock.permit_type.findMany.mockResolvedValueOnce([]);

    await listPermitTypes(prismaTxMock, Initiative.HOUSING);

    expect(prismaTxMock.permit_type.findMany).toHaveBeenCalledWith({
      include: {
        permitTypeInitiativeXref: {
          include: {
            initiative: true
          }
        }
      },
      where: {
        permitTypeInitiativeXref: {
          some: {
            initiative: {
              code: Initiative.HOUSING
            }
          }
        }
      },
      orderBy: [
        {
          businessDomain: 'asc'
        },
        {
          name: 'asc'
        }
      ]
    });
  });

  it('omits the where clause when initiative is not provided', async () => {
    prismaTxMock.permit_type.findMany.mockResolvedValueOnce([]);

    await listPermitTypes(prismaTxMock);

    expect(prismaTxMock.permit_type.findMany).toHaveBeenCalledWith({
      include: {
        permitTypeInitiativeXref: {
          include: {
            initiative: true
          }
        }
      },
      where: undefined,
      orderBy: [
        {
          businessDomain: 'asc'
        },
        {
          name: 'asc'
        }
      ]
    });
  });

  it('returns an empty array when no permit types exist', async () => {
    prismaTxMock.permit_type.findMany.mockResolvedValueOnce([]);

    const result = await listPermitTypes(prismaTxMock, Initiative.HOUSING);

    expect(result).toEqual([]);
  });

  it('propagates prisma errors', async () => {
    const error = new Error('Database failure');

    prismaTxMock.permit_type.findMany.mockRejectedValue(error);

    await expect(listPermitTypes(prismaTxMock, Initiative.HOUSING)).rejects.toThrow(error);
  });
});

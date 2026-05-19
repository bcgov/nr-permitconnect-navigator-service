import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as codeService from '../../../src/services/code.ts';

describe('listAllCodeTables', () => {
  it('returns correct structure and only active rows', async () => {
    const permitStateRows = [
      {
        code: 'IN_PROGRESS',
        display: 'In Progress',
        definition: 'desc',
        active: true,
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null
      }
    ];

    const permitStageRows = [
      {
        code: 'REVIEW',
        display: 'Review',
        definition: 'desc',
        active: true,
        createdBy: null,
        createdAt: null,
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null
      }
    ];

    prismaTxMock.permit_state_code.findMany.mockResolvedValueOnce(permitStateRows);
    prismaTxMock.permit_stage_code.findMany.mockResolvedValueOnce(permitStageRows);

    const result = await codeService.listAllCodeTables(prismaTxMock);

    expect(result.PermitState).toEqual(permitStateRows);
    expect(result.PermitStage).toEqual(permitStageRows);
    expect(prismaTxMock.permit_state_code.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true }
      })
    );
  });
});

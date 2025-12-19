import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as codeService from '../../../src/services/code.ts';

describe('listAllCodeTables', () => {
  it('calls required findMany and returns result', async () => {
    prismaTxMock.electrification_project_type_code.findMany.mockResolvedValueOnce([]);
    prismaTxMock.electrification_project_category_code.findMany.mockResolvedValueOnce([]);
    prismaTxMock.escalation_type_code.findMany.mockResolvedValueOnce([]);
    prismaTxMock.source_system_code.findMany.mockResolvedValueOnce([]);

    const response = await codeService.listAllCodeTables(prismaTxMock);

    expect(prismaTxMock.electrification_project_type_code.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.electrification_project_category_code.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.escalation_type_code.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.source_system_code.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({
      ElectrificationProjectType: [],
      ElectrificationProjectCategory: [],
      EscalationType: [],
      SourceSystem: []
    });
  });
});

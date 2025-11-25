import { prismaTxMock } from '../../__mocks__/prismaMock';

import * as reportingService from '../../../src/services/reporting';

describe('getElectrificationProjectPermitData', () => {
  it('calls $queryRaw and returns result', async () => {
    prismaTxMock.$queryRaw.mockResolvedValueOnce([{ data: 'fake' }]);

    const response = await reportingService.getElectrificationProjectPermitData(prismaTxMock);

    expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([{ data: 'fake' }]);
  });
});

describe('getHousingProjectPermitData', () => {
  it('calls $queryRaw and returns result', async () => {
    prismaTxMock.$queryRaw.mockResolvedValueOnce([{ data: 'fake' }]);

    const response = await reportingService.getHousingProjectPermitData(prismaTxMock);

    expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([{ data: 'fake' }]);
  });
});

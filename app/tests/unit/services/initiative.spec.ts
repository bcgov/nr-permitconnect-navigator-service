import { prismaTxMock } from '../../__mocks__/prismaMock';

import * as initiativeService from '../../../src/services/initiative';
import { Initiative as EInitiative } from '../../../src/utils/enums/application';

import type { Initiative } from '../../../src/types';

describe('getInitiative', () => {
  it('calls initiative.findFirstOrThrow and returns result', async () => {
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce({ initiativeId: '1' } as Initiative);
    const response = await initiativeService.getInitiative(prismaTxMock, EInitiative.HOUSING);

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ initiativeId: '1' });
  });
});

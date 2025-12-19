import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as initiativeService from '../../../src/services/initiative.ts';
import { Initiative as EInitiative } from '../../../src/utils/enums/application.ts';

import type { Initiative } from '../../../src/types/index.ts';

describe('getInitiative', () => {
  it('calls initiative.findFirstOrThrow and returns result', async () => {
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce({ initiativeId: '1' } as Initiative);
    const response = await initiativeService.getInitiative(prismaTxMock, EInitiative.HOUSING);

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual({ initiativeId: '1' });
  });
});

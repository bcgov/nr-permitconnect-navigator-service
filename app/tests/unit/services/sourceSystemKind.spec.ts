import { prismaTxMock } from '../../__mocks__/prismaMock';

import * as sourceSystemKindService from '../../../src/services/sourceSystemKind';
import { SourceSystemKind } from '../../../src/types';

describe('getSourceSystemKinds', () => {
  it('calls draft.findMany and returns result', async () => {
    prismaTxMock.source_system_kind.findMany.mockResolvedValueOnce([{ sourceSystemKindId: 1 }] as SourceSystemKind[]);

    const response = await sourceSystemKindService.getSourceSystemKinds(prismaTxMock);

    expect(prismaTxMock.source_system_kind.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.source_system_kind.findMany).toHaveBeenCalledWith({
      orderBy: {
        sourceSystem: 'asc'
      }
    });
    expect(response).toStrictEqual([{ sourceSystemKindId: 1 }]);
  });
});

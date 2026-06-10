import { TEST_ACTIVITY_HOUSING } from '../../data/index.ts';
import { prismaTxMock } from '../../../__mocks__/prismaMock.ts';
import { generateUniqueActivityId } from '../../../../src/db/utils/utils.ts';

describe('generateUniqueActivityId', () => {
  it('should return a unique ID on the first attempt if no collision occurs', async () => {
    prismaTxMock.activity.findUnique.mockResolvedValueOnce(null);

    const result = await generateUniqueActivityId(prismaTxMock);

    expect(prismaTxMock.activity.findUnique).toHaveBeenCalledTimes(1);
    expect(typeof result).toBe('string');
  });

  it('should loop and retry generating an ID if a collision is detected', async () => {
    prismaTxMock.activity.findUnique.mockResolvedValueOnce(TEST_ACTIVITY_HOUSING).mockResolvedValueOnce(null);

    const result = await generateUniqueActivityId(prismaTxMock);

    expect(prismaTxMock.activity.findUnique).toHaveBeenCalledTimes(2);
    expect(typeof result).toBe('string');
  });
});

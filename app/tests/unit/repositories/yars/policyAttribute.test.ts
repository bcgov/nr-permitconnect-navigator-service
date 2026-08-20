import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { PolicyAttributeRepository } from '#src/repositories/yars/policyAttribute';

const makeRepo = () => new PolicyAttributeRepository(prismaTxMock, 'principal-id');

describe('PolicyAttributeRepository', () => {
  const mockDbResult = [
    {
      policyId: 100,
      attribute: {
        attributeId: 10,
        name: 'TestAttribute',
        attributeGroup: [{ groupId: 1 }, { groupId: 2 }]
      }
    }
  ];

  describe('getPolicyAttributes', () => {
    it('queries by policyId, includes nested attributes and groups, and maps the result', async () => {
      prismaTxMock.policy_attribute.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getPolicyAttributes(100);

      expect(prismaTxMock.policy_attribute.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.policy_attribute.findMany).toHaveBeenCalledWith({
        where: {
          policyId: 100
        },
        include: {
          attribute: {
            include: {
              attributeGroup: true
            }
          }
        }
      });

      expect(result).toStrictEqual([
        {
          attributeId: 10,
          attributeName: 'TestAttribute',
          groupId: [1, 2]
        }
      ]);
    });
  });
});

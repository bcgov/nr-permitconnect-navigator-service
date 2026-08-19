import { mockReset } from 'vitest-mock-extended';

import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import '#tests/__mocks__/unitOfWorkMock';
import {
  getElectrificationProjectPermitDataService,
  getGeneralProjectPermitDataService,
  getHousingProjectPermitDataService
} from '#src/services/reporting';

vi.mock('config');

describe('reporting service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(prismaTxMock);
  });

  describe('getElectrificationProjectPermitDataService', () => {
    it('should execute raw query and return electrification project permit data', async () => {
      const mockData = [
        {
          project_name: 'Test Electrification Project',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '555-0100',
          email: 'john@example.com',
          activity_id: 'activity-1',
          permit_type: 'Electrical'
        }
      ];

      prismaTxMock.$queryRaw.mockResolvedValueOnce(mockData as never);

      const result = await getElectrificationProjectPermitDataService();

      expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('getGeneralProjectPermitDataService', () => {
    it('should execute raw query and return general project permit data', async () => {
      const mockData = [
        {
          project_name: 'Test General Project',
          first_name: 'Jane',
          last_name: 'Smith',
          phone_number: '555-0101',
          email: 'jane@example.com',
          activity_id: 'activity-2',
          permit_type: 'Building'
        }
      ];

      prismaTxMock.$queryRaw.mockResolvedValueOnce(mockData as never);

      const result = await getGeneralProjectPermitDataService();

      expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });

  describe('getHousingProjectPermitDataService', () => {
    it('should execute raw query and return housing project permit data', async () => {
      const mockData = [
        {
          project_name: 'Test Housing Project',
          first_name: 'Bob',
          last_name: 'Johnson',
          consent_to_feedback: 'Yes',
          phone_number: '555-0102',
          email: 'bob@example.com',
          activity_id: 'activity-3',
          street_address: '123 Main St',
          locality: 'Victoria',
          latitude: '48.4',
          longitude: '-123.4',
          permit_type: 'Housing'
        }
      ];

      prismaTxMock.$queryRaw.mockResolvedValueOnce(mockData as never);

      const result = await getHousingProjectPermitDataService();

      expect(prismaTxMock.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });
  });
});

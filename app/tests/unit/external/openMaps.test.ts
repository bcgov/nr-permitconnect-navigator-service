import axios from 'axios';

import * as mapService from '../../../src/external/openMaps.ts';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.openMaps.apiPath') {
          return 'https://mock.openmaps.api.path';
        }
        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

const mockedAxiosInstance = {
  get: vi.fn()
};

const FAKE_GEOJSON = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-80.724878, 35.265454],
        [-80.721359, 35.267276],
        [-80.724878, 35.265454]
      ]
    ]
  },
  properties: {
    name: 'Place Park'
  }
};

const FAKE_RESPONSE = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80.724878, 35.265454],
            [-80.721359, 35.267276],
            [-80.724878, 35.265454]
          ]
        ]
      },
      properties: {
        name: 'Place Park',
        PID_FORMATTED: '1234567890'
      }
    },
    {
      type: 'Feature',
      properties: {
        PID_FORMATTED: ' '
      }
    },
    {
      type: 'Feature',
      properties: {
        PID_FORMATTED: '0987654321'
      }
    }
  ]
};

describe('openMaps external service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxiosInstance as never);
  });

  describe('getPids', () => {
    it('returns an empty string if geoJson is falsy', async () => {
      const response = await mapService.getPids(null);

      expect(mockedAxios.create).not.toHaveBeenCalled();
      expect(response).toStrictEqual('');
    });

    it('calls GET /geo/pub/wfs with correct CQL_FILTER query and returns joined result', async () => {
      mockedAxiosInstance.get.mockResolvedValueOnce({ data: FAKE_RESPONSE });

      const response = await mapService.getPids(FAKE_GEOJSON);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://mock.openmaps.api.path',
          timeout: 10000
        })
      );

      expect(mockedAxiosInstance.get).toHaveBeenCalledWith(
        '/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=' +
          'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&CQL_FILTER=INTERSECTS(SHAPE, POLYGON ((4991035.28473842 263875' +
          '.18893329985, 4991185.762581227 264229.81923595816, 4991035.28473842 263875.18893329985)))'
      );

      expect(response).toStrictEqual('1234567890, 0987654321');
    });
  });
});

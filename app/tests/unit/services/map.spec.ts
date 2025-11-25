import axios from 'axios';
import config from 'config';

import * as mapService from '../../../src/services/map';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');
let mockedConfig = config as jest.MockedObjectDeep<typeof config>;

jest.mock('axios');
let mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

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
    }
  ]
};

beforeEach(() => {
  mockedConfig = config as jest.MockedObjectDeep<typeof config>;
  mockedAxios = axios as jest.MockedObjectDeep<typeof axios>;

  // Replace any instances with the mocked instance
  mockedAxios.create.mockImplementation(() => mockedAxios);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedAxios.interceptors.request.use.mockImplementation((cfg: any) => {
    return cfg;
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('getPolygonArray', () => {
  it('calls GET /geo/pub/wfs with correct query and returns result', async () => {
    mockedConfig.get.mockImplementation(() => '');

    mockedAxios.get.mockResolvedValueOnce({ data: FAKE_RESPONSE });

    const response = await mapService.getPIDs(FAKE_GEOJSON);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      // eslint-disable-next-line max-len
      '/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&CQL_FILTER=INTERSECTS(SHAPE, POLYGON ((4991035.28473842 263875.18893329985, 4991185.762581227 264229.81923595816, 4991035.28473842 263875.18893329985)))'
    );
    expect(response).toStrictEqual('1234567890');
  });
});

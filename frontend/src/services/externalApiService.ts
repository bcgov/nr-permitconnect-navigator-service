import proj4 from 'proj4';
import { storeToRefs } from 'pinia';
import { geocoderAxios, orgBookAxios } from './interceptors';
import { ADDRESS_CODER_QUERY_PARAMS, ORG_BOOK_QUERY_PARAMS } from '@/utils/constants/housing';
import { useConfigStore } from '@/store';

import type { AxiosResponse } from 'axios';

export default {
  /**
   * @function searchOrgBook
   * Calls OrgBook API to search for company names
   * @param {string} nameSearch SearchUsersOptions object containing the data to filter against
   * @returns {Promise<AxiosResponse>} An axios response or empty array
   */
  searchOrgBook(nameSearch: string): Promise<AxiosResponse> {
    return orgBookAxios().get('/search/autocomplete', { params: { q: nameSearch, ...ORG_BOOK_QUERY_PARAMS } });
  },

  searchAddressCoder(addressSearch: string): Promise<AxiosResponse> {
    return geocoderAxios().get('/addresses.json', {
      params: {
        addressString: addressSearch,
        ...ADDRESS_CODER_QUERY_PARAMS
      }
    });
  },

  // /**
  //  * @function getParcelDataFromPMBC
  //  * DataBC’s Open Web Services
  //  * Accessing geographic data via WMS/WFS
  //  * Services Provided by OCIO - Digital Platforms & Data - Data Systems & Services
  //  * ref: https://docs.geoserver.org/main/en/user/services/wfs/reference.html#getfeature
  //  * ref: https://catalogue.data.gov.bc.ca/dataset/parcelmap-bc-parcel-fabric
  //  * @returns parcel data in JSON
  //  */
  // async getParcelDataFromPMBC(polygon: Array<any>) {
  //   const { getConfig } = storeToRefs(useConfigStore());
  //   // close polygon by re-adding first point to end of array
  //   const points = polygon.concat(polygon[0]);

  //   // define the source and destination layer types
  //   // leaflet map layer
  //   const source = proj4.Proj('EPSG:4326'); // gps format of leaflet map
  //   // projection (BC Parcel data layer)
  //   proj4.defs(
  //     'EPSG:3005',
  //     'PROJCS["NAD83 / BC Albers", GEOGCS["NAD83", DATUM["North_American_Datum_1983", SPHEROID["GRS 1980",6378137,298.257222101, AUTHORITY["EPSG","7019"]], TOWGS84[0,0,0,0,0,0,0], AUTHORITY["EPSG","6269"]], PRIMEM["Greenwich",0, AUTHORITY["EPSG","8901"]], UNIT["degree",0.0174532925199433, AUTHORITY["EPSG","9122"]], AUTHORITY["EPSG","4269"]], PROJECTION["Albers_Conic_Equal_Area"], PARAMETER["standard_parallel_1",50], PARAMETER["standard_parallel_2",58.5], PARAMETER["latitude_of_center",45], PARAMETER["longitude_of_center",-126], PARAMETER["false_easting",1000000], PARAMETER["false_northing",0], UNIT["metre",1, AUTHORITY["EPSG","9001"]], AXIS["Easting",EAST], AXIS["Northing",NORTH], AUTHORITY["EPSG","3005"]]'
  //   );
  //   const dest = proj4.Proj('EPSG:3005');

  //   // convert lat/long for WFS query
  //   const result = points.map((point) => {
  //     //@ts-ignore
  //     return proj4(source, dest, { x: point.lng, y: point.lat });
  //   });

  //   // built query string for WFS request
  //   let query = '';
  //   result.forEach((point, index, array) => {
  //     query = query.concat(point.x, ' ', point.y);
  //     if (index < array.length - 1) query = query.concat(', ');
  //   });

  //   let params =
  //     '/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&CQL_FILTER=INTERSECTS(SHAPE, POLYGON ((query)))';

  //   params = params.replace('query', query);

  //   const response = await openMapsAxios().get(params);

  //   return response.data;
  // },

  async getNearestOccupant(longitude: string, lattitude: string) {
    return geocoderAxios().get('/occupants/nearest.json', {
      params: {
        point: `${longitude},${lattitude}`
      }
    });
  }
};

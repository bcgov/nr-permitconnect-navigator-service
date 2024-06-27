import icon from '@/assets/images/marker-icon-red.png';
import iconShadow from '@/assets/images/marker-shadow.png';

import type { BaseIconOptions, LatLngExpression } from 'leaflet';
/*
 * Mapping constants
 */
export const BC_BOUNDARIES_LOWER: LatLngExpression = [44, -140];

export const BC_BOUNDARIES_UPPER: LatLngExpression = [63, -109];

export const MAP_ICON_OPTIONS_RED: BaseIconOptions = {
  iconUrl: icon, //'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: iconShadow, //'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

// Lat/Long for Victoria
export const MAP_INITIAL_START_POINT: { center: LatLngExpression; zoom: number } = {
  center: [48.428, -123.365],
  zoom: 13
};

export const OSM_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const OSM_TILE_LAYER_OPTIONS = {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};

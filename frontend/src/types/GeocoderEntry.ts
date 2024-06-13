export type GeocoderEntry = {
  geometry: { coordinates: Array<number>; [key: string]: any };
  properties: { [key: string]: string };
};

export type GeocoderEntry = {
  geometry: { coordinates: number[]; [key: string]: any };
  properties: { [key: string]: string };
};

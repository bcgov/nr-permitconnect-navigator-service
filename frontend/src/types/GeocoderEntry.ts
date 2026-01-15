export interface GeocoderEntry {
  geometry: { coordinates: number[]; [key: string]: any };
  properties: Record<string, string>;
}

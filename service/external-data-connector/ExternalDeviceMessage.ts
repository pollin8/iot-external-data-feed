export const OYSTER_SCHEMA_URN = 'urn:p8:schema:oyster';
export const BINLEVEL_SCHEMA_URN ='urn:p8:schema:binlevel';
export const PEOPLECOUNTER_SCHEMA_URN ='urn:p8:schema:peoplesense';


export interface DeviceProperties extends Record<string, string | number | boolean | GeoJsonPoint | Date> {
}

export interface GeoLocation {
  lat: number,
  lon: number
}

export interface GeoJsonPoint {
  type: "Point",
  coordinates: Array<number>;
}

export interface RadioData{
  bsId: string;
  rssi: number;
  nbRep: number;
  snr: number;
}

export interface ExternalDeviceMessage<T extends DeviceProperties = DeviceProperties> {
  id: string;
  device: string;
  hardwareId: string;
  timestamp: string;
  tenantUrn:string;
  deviceUrn:string;
  schemaUrn: string;
  radio?: Array<RadioData>
  state: {
    current: T;
    previous?: Partial<T>;
  }
}


export function makeGeometryPoint(geojson: GeoJsonPoint): GeoLocation{
  const location : GeoLocation = {
      lat: geojson.coordinates[1],
      lon: geojson.coordinates[0]
  };

  return location;
}

export function isGeoJsonPoint(prop?: any): prop is GeoJsonPoint {
  if(!prop) return false;
  return (prop as GeoJsonPoint).coordinates !== undefined;
}

export const isNumber = (value: any): value is  number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isInteger = (value: any): value is  number => {
  return isNumber(value) && Number.isInteger(value);
};

export const isString = (s: any): s is string => {
  return typeof s === 'string';
};

export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean';
};

export const isDate = (value: any): value is Date => {
  return value instanceof Date;
};

export function isDefined<T>(value: null | undefined | T): value is T {
  return !isNullOrUndefined(value)
}

export function isNullOrUndefined(value: any) : boolean {
  // Note difference from ===
  return value == null ? true : false
}
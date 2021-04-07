export interface GeojsonMapOptions {
  text: string;
  map: Map;
  marker: MarkerOptions;
  area: AreaOptions;
}

interface Map {
  centerLatitude: number;
  centerLongitude: number;
  zoomToDataBounds: boolean;
  zoom: number;
  useBoundsInQuery: boolean;
  tileServerUrl: string;
  tileAttribution: string;
}

interface MarkerOptions {
  size: number;
  highlightSize: number;
}

interface AreaOptions {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  fillOpacity: number;
  highlightColor: string;
  highlightOpacity: number;
}

export interface Position {
  latitude: number;
  longitude: number;
  popup?: string;
  tooltip?: string;
}

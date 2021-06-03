import React, { ReactElement, useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { getLocationSrv } from '@grafana/runtime';
import { GeojsonMapOptions, Position } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { Geometry, Feature, GeoJsonObject, GeometryObject, GeoJsonProperties, Point } from 'geojson';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import { Icon, LeafletEvent, LatLng, LatLngBounds, Layer, marker, LeafletMouseEvent } from 'leaflet';

import './leaflet.css';
import 'leaflet/dist/leaflet.css';

interface Props extends PanelProps<GeojsonMapOptions> {}

export const MapSelectPanel: React.FC<Props> = ({ options, data, width, height, replaceVariables }) => {
  const selectedVar = replaceVariables('$selected');

  const styles = getStyles();
  const mapRef = useRef<Map | null>(null);

  const primaryIcon: string = require('img/marker.png');
  const secondaryIcon: string = require('img/marker_secondary.png');

  useEffect(() => {
    if (mapRef.current !== null) {
      const bounds = mapRef.current.leafletElement.getBounds();
      updateMap(bounds);
    }
    // eslint-disable-next-line
  }, []);

  let locations: string[] | undefined = data.series
    .find((f) => f.name === 'location')
    ?.fields.find((f) => f.name === 'Value')
    ?.values?.toArray();

  let popups: string[] | undefined = data.series
    .find((f) => f.name === 'desc')
    ?.fields.find((f) => f.name === 'Value')
    ?.values?.toArray();

  let ids: string[] | undefined = data.series
    .find((f) => f.name === 'id')
    ?.fields.find((f) => f.name === 'Value')
    ?.values?.toArray();

  let markers: number[] | undefined = data.series
    .find((f) => f.name === 'marker')
    ?.fields.find((f) => f.name === 'Value')
    ?.values?.toArray();

  if (!locations && data.series?.length) {
    locations = data.series[0].fields.find((f) => f.name === 'location')?.values.toArray();
  }

  if (!popups && data.series?.length) {
    popups = data.series[0].fields.find((f) => f.name === 'desc')?.values.toArray();
  }

  if (!ids && data.series?.length) {
    ids = data.series[0].fields.find((f) => f.name === 'id')?.values.toArray();
  }

  if (!markers && data.series?.length) {
    markers = data.series[0].fields.find((f) => f.name === 'marker')?.values.toArray();
  }

  let geoFeatures: Feature[] = [];

  locations?.forEach((g, i) => {
    let geoj: GeoJsonObject = JSON.parse(g) as GeoJsonObject;
    if (geoj.type === 'Point' || geoj.type === 'MultiPolygon' || geoj.type === 'Polygon') {
      geoFeatures.push({
        type: 'Feature',
        geometry: geoj as Geometry,
        properties: {
          popup: popups !== undefined ? popups[i] : undefined,
          selected: ids !== undefined ? ids[i] === selectedVar : false,
          id: ids !== undefined ? ids[i] : undefined,
          marker: markers !== undefined ? markers[i] : 0
        },
      });
    }
  });

  const geoJSONStyle = (feat: Feature | undefined) => {
    return {
      color: options.area.strokeColor,
      weight: options.area.strokeWidth,
      fillOpacity: feat?.properties?.selected ? options.area.highlightOpacity : options.area.fillOpacity,
      fillColor: feat?.properties?.selected ? options.area.highlightColor : options.area.fillColor,
    };
  };

  const onSelect = (feat: Feature) => {
    getLocationSrv().update({
      query: {
        'var-selected': feat.properties?.id,
      },
      partial: true,
      replace: true,
    });
  };

  const createGeo = (features: Feature[]): ReactElement[] => {
    let markers: ReactElement[] = [];
    if (features?.length > 0) {
      features.forEach((p, i) => {
        let name = p.properties?.popup as string;
        if (p.properties?.id === selectedVar) {
          i += features.length;
        }
        markers.push(
          <GeoJSON
            key={i}
            data={p}
            // onEachFeature={onEachFeature}
            pointToLayer={pointToLayer}
            onclick={(data: LeafletMouseEvent) => onSelect(data.sourceTarget.feature as Feature)}
            style={geoJSONStyle}
          />
        );
      });
    }
    return markers;
  };

  const createIcon = (url: string, size: number) => {
    return new Icon({
      iconUrl: url,
      iconSize: [size, size],
      iconAnchor: [size * 0.5, size],
      popupAnchor: [0, -size],
    });
  };

  /// TODO: Popups don't work well with changing the feature style on selecting, as changing
  /// the style will prevent the popup from showing
  const onEachFeature = (feature: Feature<GeometryObject, GeoJsonProperties>, layer: Layer) => {
    let text: string = feature.properties?.popup;
    const popupContent = ` <Popup>${text}</Popup>`;
    layer.bindPopup(popupContent);
  };

  const pointToLayer = (geoJsonPoint: Feature<Point, GeoJsonProperties>, latlng: LatLng): Layer => {
    return marker(latlng, {
      icon: createIcon(
        geoJsonPoint.properties?.marker != 0 ? secondaryIcon : primaryIcon,
        geoJsonPoint.properties?.selected ? options.marker.highlightSize : options.marker.size
      ),
    });
  };

  const geographys: ReactElement[] = createGeo(geoFeatures);

  const onMapMoveEnd = (event: LeafletEvent) => {
    if (mapRef.current !== null) {
      mapRef.current.leafletElement.invalidateSize();
    }
    updateMap(event.target.getBounds());
  };

  const updateQueryVariables = (minLat: number, minLon: number, maxLat: number, maxLon: number) => {
    getLocationSrv().update({
      query: {
        'var-minLat': minLat,
        'var-maxLat': maxLat,
        'var-minLon': minLon,
        'var-maxLon': maxLon,
      },
      partial: true,
      replace: true,
    });
  };

  const updateMap = (bounds: LatLngBounds) => {
    const minLat = bounds.getSouthWest().lat;
    const minLon = bounds.getSouthWest().lng;
    const maxLat = bounds.getNorthEast().lat;
    const maxLon = bounds.getNorthEast().lng;
    if (options.map.useBoundsInQuery) {
      updateQueryVariables(minLat, minLon, maxLat, maxLon);
    }
  };

  const mapCenter: Position = {
    latitude: options.map.centerLatitude,
    longitude: options.map.centerLongitude,
  };

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <Map
        ref={mapRef}
        center={[mapCenter.latitude, mapCenter.longitude]}
        zoom={options.map.zoom}
        zoomSnap={0.5}
        onmoveend={(event: LeafletEvent) => {
          onMapMoveEnd(event);
        }}
      >
        {geographys}
        <TileLayer attribution={options.map.tileAttribution} url={options.map.tileServerUrl} />
      </Map>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
  };
});

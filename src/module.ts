import { PanelPlugin } from '@grafana/data';
import { GeojsonMapOptions } from './types';
import { MapSelectPanel } from './MapSelectPanel';

export const plugin = new PanelPlugin<GeojsonMapOptions>(MapSelectPanel).setPanelOptions((builder) => {
  return (
    builder
      .addNumberInput({
        path: 'map.centerLatitude',
        name: 'Map center initial latitude',
        defaultValue: 40.0,
      })
      .addNumberInput({
        path: 'map.centerLongitude',
        name: 'Map center initial longitude',
        defaultValue: -98.0,
      })
      .addNumberInput({
        path: 'map.zoom',
        name: 'Initial map zoom',
        defaultValue: 3,
      })
      .addBooleanSwitch({
        path: 'map.useBoundsInQuery',
        name: 'Set map bounds as variables',
        defaultValue: false,
      })
      .addTextInput({
        path: 'map.tileServerUrl',
        name: 'Tileserver url',
        defaultValue: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      })
      .addTextInput({
        path: 'map.tileAttribution',
        name: 'Tile Attribution Note',
        defaultValue: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      })
      //marker
      .addNumberInput({
        path: 'marker.size',
        name: 'Size of point markers',
        defaultValue: 25,
      })
      .addNumberInput({
        path: 'marker.highlightSize',
        name: 'Size of highlighted point markers',
        defaultValue: 40,
      })
      //area
      .addColorPicker({
        path: 'area.fillColor',
        name: 'Area fill color',
        defaultValue: '#00cc99',
      })
      .addNumberInput({
        path: 'area.fillOpacity',
        name: 'Area fill opacity',
        defaultValue: 0.4,
      })
      .addColorPicker({
        path: 'area.highlightColor',
        name: 'Area highlight fill color',
        defaultValue: '#00cc99',
      })
      .addNumberInput({
        path: 'area.highlightOpacity',
        name: 'Area highlight fill opacity',
        defaultValue: 1.0,
      })
      .addColorPicker({
        path: 'area.strokeColor',
        name: 'Area stroke color',
        defaultValue: '#006600',
      })
      .addNumberInput({
        path: 'area.strokeWidth',
        name: 'Area stroke width',
        defaultValue: 1.0,
      })
  );
});

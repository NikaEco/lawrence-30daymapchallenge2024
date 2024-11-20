'use client';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { MVTLayer, GeoJsonLayer, MapViewState } from 'deck.gl';
import Link from 'next/link';

const MAP_STYLES = [
  { name: "Open Street Map", url: `https://maps.gishub.org/styles/openstreetmap.json` },
  { name: "Satellite", url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "Data Viz", url: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "liberty", url: `https://tiles.openfreemap.org/styles/liberty` },
  { name: "positron", url: `https://tiles.openfreemap.org/styles/positron` },
  { name: "bright", url: `https://tiles.openfreemap.org/styles/bright` },
];

const INITIAL_VIEW_STATE = {
  longitude: -0.1276,
  latitude: 51.5074,
  zoom: 12
};

const SUBCLASS_COLORS: Record<string, [number, number, number, number]> = {
  motorway: [255, 100, 100, 200],
  primary: [255, 150, 150, 200],
  secondary: [255, 200, 200, 200],
  tertiary: [255, 220, 220, 200],
  residential: [200, 200, 200, 200],
  footway: [150, 150, 150, 200],
  park: [100, 255, 100, 200],
  water: [100, 100, 255, 200],
  building: [180, 180, 180, 200],
  commercial: [255, 200, 100, 200],
  retail: [255, 150, 100, 200],
  industrial: [200, 200, 255, 200],
  railway: [100, 100, 100, 200],
};

const OSMMap: React.FC = () => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [enabledSubclasses, setEnabledSubclasses] = useState<string[]>([]);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const toggleSubclass = (subclass: string) => {
    setEnabledSubclasses(prev => 
      prev.includes(subclass) 
        ? prev.filter(s => s !== subclass)
        : [...prev, subclass]
    );
  };

  // using the fake url from Carto Street tile url, based on demo by https://github.com/visgl/deck.gl/discussions/7988
  // OSMF's url is https://vector.openstreetmap.org/shortbread_v1/tilejson.json
  // consider trying https://deck.gl/docs/api-reference/extensions/data-filter-extension as alternative too
  const layers = [
    new MVTLayer({
      id: 'mvt',
      data: [ "https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt" ],
      stroked: true,
      pickable: true,
      autoHighlight: true,
      getFillColor: (f) => {
        const subclass = f.properties.subclass || f.properties.class;
        return SUBCLASS_COLORS[subclass] || [150, 150, 150, 200];
      },
      maxZoom: 14,
      minZoom: 0,
      binary: false,
      renderSubLayers: (props) => {
        // @ts-expect-error TODO fix this error
        const features = props.data.filter(d => 
          enabledSubclasses.includes(d.properties.subclass) || 
          enabledSubclasses.includes(d.properties.class)
        );
        return new GeoJsonLayer({
          ...props,
          data: features
        });
      },
      updateTriggers: {
        renderSubLayers: enabledSubclasses,
      }
    })
  ];

  return (
    <main className="w-screen h-screen relative" onContextMenu={(evt) => evt.preventDefault()}>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        getTooltip={({object}) => object && (object.properties.name || object.properties.subclass || object.properties.class)}
      >
        <MaplibreGL
          mapStyle={MAP_STYLES[currentMapStyle].url}
          attributionControl={false}
        />
      </DeckGL>

      <div className="absolute top-4 right-4 w-64 bg-white/90 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <h3 className="font-bold mb-4">Layer Controls</h3>
          <div className="space-y-2">
            {Object.keys(SUBCLASS_COLORS).map((subclass) => (
              <div key={subclass} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {subclass.replace(/_/g, ' ')}
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={enabledSubclasses.includes(subclass)}
                    onChange={() => toggleSubclass(subclass)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:bg-blue-500"
                  />
                  <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>⬅️ Homepage</Link>
      </div>

      <button
        onClick={cycleMapStyle}
        className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center space-x-2"
      >
        <span className="material-icons text-xl">map</span>
        <span>{MAP_STYLES[currentMapStyle].name}</span>
      </button>
    </main>
  );
};

export default OSMMap;
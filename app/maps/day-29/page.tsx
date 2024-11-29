'use client';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { GeoJsonLayer, MapViewState, TileLayer } from 'deck.gl';
import Link from 'next/link';


const MAP_STYLES = [
  { name: "Dark Matter", url: `https://tiles.openfreemap.org/styles/dark` },
  { name: "Data Viz", url: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "Satellite", url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "liberty", url: `https://tiles.openfreemap.org/styles/liberty` },
  { name: "Open Street Map", url: `https://maps.gishub.org/styles/openstreetmap.json` },
  { name: "positron", url: `https://tiles.openfreemap.org/styles/positron` },
  { name: "bright", url: `https://tiles.openfreemap.org/styles/bright` },
];

const INITIAL_VIEW_STATE = { // singapore
  longitude: 103.82,
  latitude: 1.36,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

const UkraineRussianWarMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);


  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  // const [buildings, setBuildings] = useState(null);

  // useEffect(() => {
  //   fetch('/api/duckdb')
  //     .then(res => res.json())
  //     .then(setBuildings);
  // }, []);

  const layers = [
    new TileLayer({
      // Use geojsonlayer inside of tilelayer. This is instead of MVT Layer, which has optimizations that can cause clipping when polygon extends beyond Tile area.
      id: "VectorTileLayer",
      data: "https://www.fused.io/server/v1/realtime-shared/3aadf7a892ace2f6efab8da9720f1da241fc4403e7722f501ab45503e094a13d/run/tiles/{z}/{x}/{y}?dtype_out_vector=geojson",
      maxZoom: 19,
      minZoom: 0,
    
      renderSubLayers: (props) => {
        const { boundingBox } = props.tile;
    
        return new GeoJsonLayer(props, {
          data: props.data,
          stroked: true,
          getLineColor: [0, 255, 10],
          getLineWidth: 10,
          getFillColor: [0, 40, 0, 0.5],
          getPointRadius: 4,
          pointRadiusUnits: "pixels",
          // @ts-expect-error TODO
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
        });
      },
    })
    // buildings && new GeoJsonLayer({
    //   id: 'buildings',
    //   data: buildings,
    //   filled: true,
    //   extruded: true,
    //   wireframe: true,
    //   getElevation: d => (d.properties as Building).height || 20,
    //   getFillColor: [160, 160, 180, 200],
    //   pickable: true,
    //   autoHighlight: true
    // })
  ];

  return (
    <main className="w-screen h-screen relative" onContextMenu={(evt) => evt.preventDefault()}>
      <DeckGL
        viewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        getTooltip={({object}) => {
          if (!object) return null;
  
          return {
              html: `<div>${object.properties.NAME}</div>`,
              style: {
                maxWidth: '200px', // Set your desired width
                width: 'fit-content',
                whiteSpace: 'normal'
              }
            };
        }}
      >
        <MaplibreGL
          mapStyle={MAP_STYLES[currentMapStyle].url}
          attributionControl={false}
        />
      </DeckGL>

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

export default UkraineRussianWarMap;
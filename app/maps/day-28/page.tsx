'use client';

import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { MapViewState, PathLayer } from 'deck.gl';
import Link from 'next/link';
import {Feature, FeatureCollection} from 'geojson';

const MAP_STYLES = [
  { name: "Satellite", url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "liberty", url: `https://tiles.openfreemap.org/styles/liberty` },
  { name: "Open Street Map", url: `https://maps.gishub.org/styles/openstreetmap.json` },
  { name: "Data Viz", url: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "positron", url: `https://tiles.openfreemap.org/styles/positron` },
  { name: "bright", url: `https://tiles.openfreemap.org/styles/bright` },
];

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 1,
  pitch: 0,
  bearing: 0
};

interface OceanCurrentProperties {
  OBJECTID: number;
  Layer: string;
  OBJECTID_1: number;
  TEMP: string;
  SCALE: number;
  NAME: string;
}

const UkraineRussianWarMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [oceanCurrentData, setOceanCurrentData] = useState<FeatureCollection>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/Major Ocean Currents 100m.geojson');
        const data = await response.json();
        setOceanCurrentData(data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);


  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const layers = [
    new PathLayer({
      id: 'ocean-currents',
      data: oceanCurrentData?.features,
      pickable: true,
      widthScale: 1,
      widthMinPixels: 2,
      getPath: (feature) => {
        if (feature.geometry.type === 'Polygon') {
          // Return first line string from polygon
          return feature.geometry.coordinates[0];
        }
        return [];
      },
      getColor: (feature: Feature) => {
        const properties = feature.properties as OceanCurrentProperties;
        return properties.TEMP === 'warm' ? [255, 0, 0] : [0, 0, 255];
      },
      getWidth: 1,
      billboard: false,
    })
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
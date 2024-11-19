'use client';
import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { TextLayer, MapViewState } from 'deck.gl';
import Link from 'next/link';

const MAP_STYLES = [
  {
    name: "Satellite",
    url:  `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_ACCESS_TOKEN}`
  },
  {
    name: "Data Viz",
    url: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}`
  }
];

// Dubai Love Lake coordinates
const DUBAI_LOVE_LAKE = {
  longitude: 55.405,
  latitude: 24.838,
  zoom: 16,
  pitch: 0,
  bearing: 90  // Rotate 90 degrees clockwise to properly read the love shape
};

const createTextLayer = (id: string, text: string, position: [number, number]) => {
  return new TextLayer({
    id,
    data: [{
      position,
      text
    }],
    getPosition: d => d.position,
    getText: d => d.text,
    getSize: 32,
    sizeUnits: 'pixels',  // This ensures size is in screen pixels
    sizeScale: 1,
    billboard: true,      // Ensures text always faces camera
    getAngle: 0,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    getPixelOffset: [0, 0],
    fontFamily: 'Arial',
    fontWeight: 'bold',
    getColor: [255, 255, 255],
    background: true,
    backgroundColor: [0, 0, 0, 200],
    backgroundPadding: [8, 4],
    parameters: {
      depthTest: false
    }
  });
};

const DubaiLoveLakeMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(DUBAI_LOVE_LAKE);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };
  

  const layers = [
    createTextLayer('nika-text', 'Nika', [55.4019, 24.8430]),
    createTextLayer('planet-text', 'This Planet', [55.4019, 24.8330])
  ];

  return (
    <main className="w-screen h-screen relative" onContextMenu={(evt) => evt.preventDefault()}>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
      >
        <MaplibreGL
          mapStyle={MAP_STYLES[currentMapStyle].url}
          attributionControl={false}
        />
      </DeckGL>

      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>
          ⬅️ Homepage
        </Link>
      </div>

      {/* Map style switcher */}
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

export default DubaiLoveLakeMap;
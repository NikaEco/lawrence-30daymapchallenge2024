'use client';

import { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { TripsLayer } from '@deck.gl/geo-layers';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { PathLayer } from '@deck.gl/layers';
import { GOOGLE_MAPS_API_KEY, MAPBOX_ACCESS_TOKEN } from '../../env';
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

// source file is https://github.com/bacinger/f1-circuits/blob/master/circuits/sg-2008.geojson, we removed points at the bend to smoothen the trip layer's animation
const F1_COORDINATES = [
  [103.864144, 1.291728],
  [103.8644, 1.289773],
  [103.864014, 1.288802],
  [103.863647, 1.288694],
  [103.862844, 1.288738],
  [103.861606, 1.28887],
  [103.861207, 1.289226],
  [103.860819, 1.289562],
  [103.859906, 1.289614],
  [103.857335, 1.289751],
  [103.856582, 1.289958],
  [103.85567, 1.290759],
  [103.85528, 1.291092],
  [103.855006, 1.291138],
  [103.854697, 1.290522],
  [103.854392, 1.289008],
  [103.853943, 1.286718],
  [103.853749, 1.286566],
  [103.853511, 1.286718],
  [103.852848, 1.287436],
  [103.852375, 1.288105],
  [103.851992, 1.288694],
  [103.851563, 1.289366],
  [103.851715, 1.289625],
  [103.852328, 1.290722],
  [103.853117, 1.292139],
  [103.853622, 1.292596],
  [103.853982, 1.292358],
  [103.854809, 1.291491],
  [103.855327, 1.292214],
  [103.855763, 1.292952],
  [103.856139, 1.29299],
  [103.858459, 1.291648],
  [103.859101, 1.291454],
  [103.862373, 1.291261],
  [103.862801, 1.291459],
  [103.862885, 1.292128],
  [103.862507, 1.293404],
  [103.86235, 1.294099],
  [103.862595, 1.29489],
  [103.862976, 1.294628],
  [103.863447, 1.294402],
  [103.863955, 1.293094],
  [103.864144, 1.291728]
];

const pathData = [{
  path: F1_COORDINATES
}];

const tripData = [{
  path: F1_COORDINATES.map((coord, index) => ({
    coordinates: coord,
    timestamp: index
  }))
}];


// Initial viewport centered on Singapore F1 circuit
const INITIAL_VIEW_STATE = {
  longitude: 103.858,
  latitude: 1.291,
  zoom: 14,
  pitch: 45,
  bearing: 0
};

const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export default function Home() {
  const [time, setTime] = useState(0);
  const [animation, setAnimation] = useState<{ id?: number }>({});
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [credits, setCredits] = useState('');

  const animate = () => {
    const loopLength = F1_COORDINATES.length;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / 1;
    setTime(((timestamp % loopTime) / loopTime) * loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    const animationId = window.requestAnimationFrame(animate);
    setAnimation({ id: animationId });
    return () => window.cancelAnimationFrame(animationId);
  }, []);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const layers = [
    // 3D Buildings Layer
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      onTilesetLoad: tileset3d => {
        tileset3d.options.onTraversalComplete = selectedTiles => {
          const uniqueCredits = new Set();
          selectedTiles.forEach(tile => {
            const {copyright} = tile.content.gltf.asset;
            copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
          });
          setCredits([...uniqueCredits].join('; '));
          return selectedTiles;
        };
      },
      loadOptions: {
        fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
      },
      operation: 'terrain+draw'
    }),
    // Base track outline (black border)
    new PathLayer({
      id: 'f1-circuit-outline',
      data: pathData,
      getPath: d => d.path,
      getColor: [0, 0, 0],
      getWidth: 20,
      opacity: 1,
      widthScale: 1,
      widthMinPixels: 20,
      widthMaxPixels: 100,
      capRounded: true,
      jointRounded: true,
      parameters: {
        depthTest: false
      }
    }),
    // Main track path (gray surface)
    new PathLayer({
      id: 'f1-circuit-main',
      data: pathData,
      getPath: d => d.path,
      getColor: [128, 128, 128],
      getWidth: 16,
      opacity: 1,
      widthScale: 1,
      widthMinPixels: 16,
      widthMaxPixels: 80,
      capRounded: true,
      jointRounded: true,
      parameters: {
        depthTest: false
      }
    }),
    // Center stripe (instead of yellow, using white for better stability)
    new PathLayer({
      id: 'f1-circuit-center',
      data: pathData,
      getPath: d => d.path,
      getColor: [200, 200, 200], // Changed to light gray instead of yellow
      getWidth: 4,
      opacity: 0.9,
      widthScale: 1,
      widthMinPixels: 4,
      widthMaxPixels: 20,
      capRounded: true,
      jointRounded: true,
      parameters: {
        depthTest: false,
        blend: true,
      }
    }),
    // Animated car with trail
    new TripsLayer({
      id: 'f1-circuit-car',
      data: tripData,
      getPath: (d: { path: { coordinates: [number, number] }[] }) => d.path.map((p: { coordinates: [number, number] }) => p.coordinates),
      getTimestamps: (d: { path: { timestamp: number }[] }) => d.path.map((p: { timestamp: number }) => p.timestamp),
      getColor: [255, 50, 50], // Slightly darker red
      opacity: 1,
      widthMinPixels: 12,
      widthMaxPixels: 30,
      rounded: true,
      trailLength: 0.4,
      currentTime: time,
      fadeTrail: true,
      parameters: {
        depthTest: false
      }
    })
  ];

  return (
    <main className="w-screen h-screen relative">
      <div onContextMenu={(evt) => evt.preventDefault()}>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={{touchRotate: true, inertia: 250}}
          layers={layers}
        >
          <MaplibreGL
            mapStyle={MAP_STYLES[currentMapStyle].url}
            attributionControl={false}
          />
        </DeckGL>
      </div>

       {/* return button */}
       <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>
          Homepage
        </Link>
      </div>

      {/* Circuit info overlay */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded">
        <h2 className="font-bold text-lg">Marina Bay Street Circuit</h2>
        <p>Length: 4.928 km</p>
        <p>First GP: 2008</p>
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
}
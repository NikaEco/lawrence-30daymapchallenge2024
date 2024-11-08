'use client';

import { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '../../env';
import Link from 'next/link';
import { H3HexagonLayer } from 'deck.gl';

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

type SudanFloodData = {
  state: string;
  locality: string;
  houses_destroyed: number;
  houses_damaged: number;
  households_affected: number;
  people_killed: number;
  people_injured: number;
  people_affected: number;
  latitude: number;
  longitude: number;
  hex_id: string;
}

const ELEVATION_FIELDS = [
  { label: 'Houses Destroyed', value: 'houses_destroyed' },
  { label: 'Houses Damaged', value: 'houses_damaged' },
  { label: 'Households Affected', value: 'households_affected' },
  { label: 'People Killed', value: 'people_killed' },
  { label: 'People Injured', value: 'people_injured' },
  { label: 'People Affected', value: 'people_affected' }
] as const;

type ElevationField = typeof ELEVATION_FIELDS[number]['value'];

// Initial viewport centered on Sudan 
const INITIAL_VIEW_STATE = {
  longitude: 32.5,
  latitude: 15.5,
  zoom: 6,
  pitch: 45,
  bearing: 0
};

// const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

export default function Home() {
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [floodData, setFloodData] = useState<SudanFloodData[]>([]);
  const [elevationField, setElevationField] = useState<ElevationField>('houses_destroyed');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/sudan-floods-2024.json');
        const data = await response.json();
        setFloodData(data);
      } catch (error) {
        console.error('Error loading flood data:', error);
      }
    };

    loadData();
  }, []);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const layers = [
    // 3D Buildings Layer
    // new Tile3DLayer({
    //   id: 'google-3d-tiles',
    //   data: TILESET_URL,
    //   onTilesetLoad: tileset3d => {
    //     tileset3d.options.onTraversalComplete = selectedTiles => {
    //       const uniqueCredits = new Set();
    //       selectedTiles.forEach(tile => {
    //         const {copyright} = tile.content.gltf.asset;
    //         copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
    //       });
    //       return selectedTiles;
    //     };
    //   },
    //   loadOptions: {
    //     fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
    //   },
    //   operation: 'terrain+draw'
    // }),
    // Sudan flood data shown as H3 hexagons
    new H3HexagonLayer<SudanFloodData>({
      id: 'flood-hexagons',
      data: floodData,
      extruded: true,
      getHexagon: d => d.hex_id,
      getFillColor: d => [255, (1 - d[elevationField] / 1000) * 255, 0],
      getElevation: d => d[elevationField],
      elevationScale: 20, // Reduced from 100 to make pillars shorter
      coverage: 0.9, // Increased from default 0.6 to make hexagons wider
      pickable: true,
      updateTriggers: {
        getFillColor: [elevationField],
        getElevation: [elevationField]
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
       <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>
          ⬅️ Homepage
        </Link>
      </div>

      {/* Damage category switcher overlay */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded">
        <h2 className="font-bold text-lg">Sudan Flood Data 2024</h2>
        <p>Damage category</p>
        <select
          value={elevationField}
          onChange={(e) => setElevationField(e.target.value as ElevationField)}
          className="bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          {ELEVATION_FIELDS.map(field => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
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
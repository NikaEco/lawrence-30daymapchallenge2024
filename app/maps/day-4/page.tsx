'use client';

import { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '../../env';
import Link from 'next/link';
import { H3ClusterLayer } from 'deck.gl';

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

// Initial viewport centered at EU
const INITIAL_VIEW_STATE = {
    longitude: 10,
    latitude: 50,
    zoom: 3.5,
    pitch: 0,
    bearing: 0
};

type TrainStationData = {
  clusters: {
    hexIds: string[];
    count: number;
    mean_latitude: number;
    mean_longitude: number;
  }[];
  min_count: number;
  max_count: number;
}

export default function Home() {
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [clusterData, setClusterData] = useState<TrainStationData>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/eu-train-station-h3-clusters.json');
        const data = await response.json();
        setClusterData(data);
      } catch (error) {
        console.error('Error loading cluster data:', error);
      }
    };

    loadData();
  }, []);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const layers = [
    // train stations in EU shown as H3 clusters
      new H3ClusterLayer({
        id: 'hdx-h3',
        data: clusterData?.clusters,
        stroked: true,
        getHexagons: (d) => d.hexIds,
        getFillColor: (d) => [
            255,
            (d.count / (clusterData?.max_count ?? 1)) * 255,
            0,
        ],
        getLineColor: (d) => [
            255,
            (d.count / (clusterData?.max_count ?? 1)) * 255,
            0,
        ],
        lineWidthMinPixels: 2,
        pickable: true,
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
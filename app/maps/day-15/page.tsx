'use client';
import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { TileLayer } from '@deck.gl/geo-layers';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { BitmapLayer, MapViewState } from 'deck.gl';
import Link from 'next/link';

const SINGAPORE_BOUNDS = [
  103.535,
  1.144,
  104.502,
  1.494
];

const INITIAL_VIEW_STATE = {
  longitude: 103.8198,
  latitude: 1.3521,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

const SingaporeLandLotMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);

  const tileLayer = new TileLayer({
    data: 'https://www.onemap.gov.sg/maps/tiles/LandLot/{z}/{x}/{y}.png',
    minZoom: 11,
    maxZoom: 19,
    tileSize: 256,
    extent: SINGAPORE_BOUNDS,
    renderSubLayers: (props) => {
        const { boundingBox } = props.tile;
        return new BitmapLayer(props, {
          // @ts-expect-error TODO fix
          data: null,
          image: props.data,
          bounds: [
            boundingBox[0][0],
            boundingBox[0][1],
            boundingBox[1][0],
            boundingBox[1][1],
          ],
        });
    },
    loadOptions: {
      fetch: {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referrer': 'https://www.onemap.gov.sg/'
        }
      }
    },
    onTileError: (err) => {
      console.warn('Tile loading error:', err);
      return null;
    }
  });

  return (
    <main className="w-screen h-screen relative">
        <DeckGL
            initialViewState={viewState}
            controller={true}
            layers={[tileLayer]}
            onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        >
            <MaplibreGL
            mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}`}
            attributionControl={false}
            />
        </DeckGL>

        {/* return button */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>
            ⬅️ Homepage
        </Link>
        </div>
    </main>
  );
};

export default SingaporeLandLotMap;
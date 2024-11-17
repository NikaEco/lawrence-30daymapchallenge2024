'use client';
import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { GeoJsonLayer, MapViewState, PickingInfo } from 'deck.gl';
import Link from 'next/link';
import type { FeatureCollection } from 'geojson';

const MIN_POWER = 48300.0;
const MAX_POWER = 5523000000000.0;

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,  
  pitch: 0,
  bearing: 0
};

const SingaporeLandLotMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [data, setData] = useState<FeatureCollection>();

  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        const response = await fetch('/data/world_power.geojson');
        const geoJsonData = await response.json();
        setData(geoJsonData);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      }
    };

    loadGeoJson();
  }, []);

  const geojsonLayer = new GeoJsonLayer({
      id: 'power-layer',
      data,
      pickable: true,
      getFillColor: f => {
          const value = f.properties.power_consumption_kwh;
          // Normalize the value between 0 and 1
          const normalized = (value - MIN_POWER) / (MAX_POWER - MIN_POWER);
          // Interpolate between light blue and dark blue
          return [
            // R: 165 -> 17
            Math.floor(165 - (normalized * (165 - 17))),
            // G: 216 -> 95
            Math.floor(216 - (normalized * (216 - 95))),
            // B: 255 -> 182
            Math.floor(255 - (normalized * (255 - 182))),
            180  // alpha
          ];
      },
      getLineColor: [0, 0, 0, 255],
      getLineWidth: 1,
      lineWidthMinPixels: 2,
  });

  return (
    <main className="w-screen h-screen relative">
        <DeckGL
            initialViewState={viewState}
            controller={true}
            layers={[geojsonLayer]}
            onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
            getTooltip={(pickingInfo: PickingInfo) => {
              if (pickingInfo.layer instanceof GeoJsonLayer && pickingInfo.object) {
                const props = Object.entries(pickingInfo.object.properties);
                if (props.length > 0) {
                  return {
                    html: props
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('<br/>'),
                    style: {
                      backgroundColor: '#fff',
                      padding: '6px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                    }
                  };
                }
              }
              return null;
            }}
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
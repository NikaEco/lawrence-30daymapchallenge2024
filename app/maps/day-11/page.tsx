'use client';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { _GlobeView as GlobeView, TileLayer, BitmapLayer, GeoJsonLayer, PickingInfo } from 'deck.gl';
import Link from 'next/link';
import type { FeatureCollection } from 'geojson';

// Initial view state centered on Arctic
const INITIAL_VIEW_STATE = {
  'arctic-globe': {
    latitude: 85,
    longitude: 0,
    zoom: 2,
    pitch: 30,
    bearing: 0
  }
};

// Using data from the Global Biodiversity Information Facility (GBIF) 
// and the International Union for Conservation of Nature (IUCN)
const EXTINCT_RANGES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        species: 'Great Auk (Pinguinus impennis)',
        extinctionYear: 1852,
        cause: 'Overhunting for feathers, meat, fat, and eggs',
        status: 'Extinct',
        description: 'A flightless seabird that bred in large colonies on rocky, isolated islands. The last confirmed sightings were in the 1840s.',
        habitat: 'Coastal cliffs and rocky islands for breeding, spent most life at sea',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKRdSf6ILSh3UXOBw4fsTjoq7gO6uabbRV8A&s'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Newfoundland and Gulf of St. Lawrence
          [[[-65, 46], [-56, 46], [-56, 52], [-65, 52], [-65, 46]]],
          // Greenland coastal waters
          [[[-53, 59], [-42, 59], [-42, 67], [-53, 67], [-53, 59]]],
          // Iceland
          [[[-24, 63], [-14, 63], [-14, 66], [-24, 66], [-24, 63]]],
          // Faroe Islands
          [[[-7.5, 61.5], [-6.5, 61.5], [-6.5, 62.5], [-7.5, 62.5], [-7.5, 61.5]]],
          // Norway coastal waters
          [[[4, 58], [10, 58], [10, 63], [4, 63], [4, 58]]],
          // Ireland and British Isles
          [[[-10, 50], [-2, 50], [-2, 58], [-10, 58], [-10, 50]]]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        species: "Steller's Sea Cow (Hydrodamalis gigas)",
        extinctionYear: 1768,
        cause: 'Hunted to extinction within 27 years of European discovery',
        status: 'Extinct',
        description: 'A massive marine mammal that relied on kelp and sea grasses for food. Their slow movements made them easy targets for hunters.',
        habitat: 'Shallow, kelp-rich coastal waters',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPo5342jsxn1ppEXw2hdLYpXkilZcQFpnSAw&s'
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Commander Islands (core range at time of discovery)
          [[[165, 54.5], [168, 54.5], [168, 55.5], [165, 55.5], [165, 54.5]]],
          // Historical range along northern Pacific coastline (pre-European contact)
          [[[160, 52], [190, 52], [190, 60], [160, 60], [160, 52]]],
          // Bering Sea region
          [[[170, 55], [180, 55], [180, 58], [170, 58], [170, 55]]]
        ]
      }
    }
  ]
} as FeatureCollection;;

export default function ArcticGlobePage() {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo | null>(null);

  const layers = [
    // Satellite base map layer
    new TileLayer({
      id: 'satellite',
      data: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: (props) => {
        const { boundingBox } = props.tile;
        return new BitmapLayer(props, {
            // @ts-expect-error TODO: fix this
            data: null,
            image: props.data,
            bounds: [
                boundingBox[0][0],
                boundingBox[0][1],
                boundingBox[1][0],
                boundingBox[1][1],
            ],
        });
      }}),
      // Historical ranges layer
      new GeoJsonLayer({
        id: 'extinct-ranges',
        data: EXTINCT_RANGES,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1,
        getFillColor: [255, 0, 0, 100],
        getLineColor: [255, 255, 255],
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 100],
        onHover: (info: PickingInfo) => setHoverInfo(info),
        updateTriggers: {
          getFillColor: []
        }
      })
  ];

  const views = [
    new GlobeView({
      id: 'arctic-globe',
      resolution: 1,
    })
  ];

  const renderTooltip = () => {
    if (!hoverInfo?.object) return null;
    const { x, y, object } = hoverInfo;
    const { species, extinctionYear, cause, description, imageUrl, source } = object.properties;

    return (
      <div 
        className="absolute p-4 bg-white/95 rounded-lg shadow-lg"
        style={{ 
          left: x,
          top: y,
          maxWidth: '300px',
          transform: 'translate(-50%, -100%)',
          pointerEvents: 'none'
        }}
      >
        <img 
          src={imageUrl} 
          alt={species}
          className="w-full h-40 object-cover rounded-lg mb-2"
        />
        <h3 className="font-bold text-lg text-black/95">{species}</h3>
        <p className="text-sm text-gray-600">Extinct: {extinctionYear}</p>
        <p className="text-sm mt-1 text-gray-600">{description}</p>
        <p className="text-sm text-gray-500 mt-2">Cause: {cause}</p>
        <p className="text-xs text-gray-400 mt-1">Source: {source}</p>
      </div>
    );
  };

  return (
    <main className="w-screen h-screen relative">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        views={views}
        layers={layers}
      />
      {renderTooltip()}

       {/* return button */}
       <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded">
        <Link href='/'>
          ⬅️ Homepage
        </Link>
      </div>
    </main>
  );
}
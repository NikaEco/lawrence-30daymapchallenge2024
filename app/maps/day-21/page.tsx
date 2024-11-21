'use client';

import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { GeoJsonLayer, MapViewState, FlyToInterpolator } from 'deck.gl';
import Link from 'next/link';
import {FeatureCollection} from 'geojson';

const MAP_STYLES = [
  { name: "liberty", url: `https://tiles.openfreemap.org/styles/liberty` },
  { name: "Open Street Map", url: `https://maps.gishub.org/styles/openstreetmap.json` },
  { name: "Satellite", url: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "Data Viz", url: `https://api.maptiler.com/maps/dataviz/style.json?key=${MAPBOX_ACCESS_TOKEN}` },
  { name: "positron", url: `https://tiles.openfreemap.org/styles/positron` },
  { name: "bright", url: `https://tiles.openfreemap.org/styles/bright` },
];

const INITIAL_VIEW_STATE = {
  longitude: 31.1656,
  latitude: 48.3794,
  zoom: 5,
};


const WAR_EVENTS = [
  {
    year: 2014,
    coordinates: [34.8700, 44.9575], // Coordinates near Crimea
    description: 'Annexation of Crimea by Russia',
  },
  {
    year: 2022,
    coordinates: [30.5161, 50.4475], // Coordinates for Kyiv
    description: 'Start of Russia’s large-scale invasion of Ukraine, aiming for a quick victory, but facing stiff resistance from Ukrainian forces.',
  },
  {
    year: 2022,
    coordinates: [36.5853, 49.2327], // Coordinates near Kherson
    description: 'Russian annexation of Kherson Oblast, despite heavy resistance.',
  },
  {
    year: 2022,
    coordinates: [37.6043, 48.5534], // Coordinates near Donetsk
    description: 'Continued fighting in Donbas region (Donetsk and Luhansk), Russia consolidates control.',
  },
  {
    year: 2023,
    coordinates: [35.295, 47.774], // Coordinates near Zaporizhzhia
    description: 'Ukrainian counteroffensive begins, targeting Russian positions in Zaporizhzhia and Donetsk.',
  },
  {
    year: 2024,
    coordinates: [38.148, 51.123], // Coordinates near Kursk, Russia
    description: 'Ukrainian surprise incursion into Russia’s Kursk Oblast to relieve pressure on Ukrainian forces in the south.',
  },
];

const POLYGONS = [
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[33.5, 44.3], [34.0, 44.3], [34.0, 45.0], [33.5, 45.0], [33.5, 44.3]], // Crimea area
      ],
    },
    properties: {
      name: 'Crimea Conflict Area',
      description: 'In February 2014, Russia annexed Crimea after deploying unmarked troops. This sparked widespread international condemnation and the beginning of the conflict in the Donbas.',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[29.9, 49.0], [30.5, 49.0], [30.5, 50.0], [29.9, 50.0], [29.9, 49.0]], // Kyiv Offensive area
      ],
    },
    properties: {
      name: 'Kyiv Offensive Area',
      description: 'In late February 2022, Russia launched an unsuccessful attempt to capture Kyiv. Despite heavy bombardment, Ukrainian forces mounted a successful defense, forcing Russian troops to retreat.',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[36.3, 48.6], [37.0, 48.6], [37.0, 49.1], [36.3, 49.1], [36.3, 48.6]], // Kherson area
      ],
    },
    properties: {
      name: 'Kherson Area',
      description: 'Kherson was annexed by Russia in 2022, but Ukrainian forces successfully reclaimed the city and surrounding regions later in 2022, marking a significant blow to Russia.',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[36.5, 47.8], [37.0, 47.8], [37.0, 48.3], [36.5, 48.3], [36.5, 47.8]], // Donbas region
      ],
    },
    properties: {
      name: 'Donbas (Donetsk & Luhansk) Conflict Area',
      description: 'Donbas has been a hotspot of fighting since 2014, where Russia has supported separatists in Donetsk and Luhansk. Despite Ukrainian efforts, Russia maintains control over significant parts of the region.',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[35.2, 47.3], [35.7, 47.3], [35.7, 47.8], [35.2, 47.8], [35.2, 47.3]], // Zaporizhzhia region
      ],
    },
    properties: {
      name: 'Zaporizhzhia Offensive Area',
      description: 'In 2023, Ukrainian forces launched a counteroffensive in Zaporizhzhia, regaining several key territories from Russian forces amidst challenging minefields and fortifications.',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[38.1, 50.0], [38.6, 50.0], [38.6, 50.5], [38.1, 50.5], [38.1, 50.0]], // Kursk Oblast, Russia
      ],
    },
    properties: {
      name: 'Kursk Oblast Incursion',
      description: 'In August 2024, Ukrainian forces launched a surprise incursion into Kursk Oblast, temporarily seizing several border towns and crossings in a bold move to relieve pressure on the southern front.',
    },
  },
];

const UkraineRussianWarMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [selectedYear, setSelectedYear] = useState(WAR_EVENTS[0].year);

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const layers = [
    new GeoJsonLayer({
      id: 'war-polygons',
      data: { type: 'FeatureCollection', features: POLYGONS } as FeatureCollection,
      filled: true,
      getFillColor: [139, 0, 0, 200],
      stroked: false,
      pickable: true,
    }),
  ];

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    const eventDetails = WAR_EVENTS.find((e) => e.year === year);
    if (eventDetails) {
      setViewState({
        ...viewState,
        longitude: eventDetails.coordinates[0],
        latitude: eventDetails.coordinates[1],
        zoom: 7,
        transitionInterpolator: new FlyToInterpolator({
                                  speed: 2,
        }),
        transitionDuration: 'auto',
      });
    }
  };

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
              html: `<div>${object.properties.name}\n\n${object.properties.description}</div>`,
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

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white p-4 rounded w-2/3">
        <label htmlFor="timeline-slider" className="block text-center mb-2">
          Timeline: {selectedYear} - {WAR_EVENTS.find((e) => e.year === selectedYear)?.description}
        </label>
        <input
          id="timeline-slider"
          type="range"
          min={WAR_EVENTS[0].year}
          max={WAR_EVENTS[WAR_EVENTS.length - 1].year}
          step="1"
          value={selectedYear}
          onChange={handleSliderChange}
          className="w-full"
        />
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
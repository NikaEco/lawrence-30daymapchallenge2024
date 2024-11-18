'use client';

import React, { useCallback, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PickingInfo, ScenegraphLayer } from 'deck.gl';
import Link from 'next/link';
import { FlyToInterpolator } from '@deck.gl/core';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';

const MAP_STYLES = [
  {
    name: "ArcGIS Hybrid",
    url: "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json"
  },
  {
    name: "OpenStreetMap",
    url:  `https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json`
  },
  {
    name: "OSMF",
    url:  `https://maps.gishub.org/styles/openstreetmap.json`
  },
  {
    name: "Dark Matter",
    url: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
  },
  {
    name: "Voyager",
    url: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`
  }
];

type UfoSighting = {
  name: string;
  coordinates: [longitude: number, latitude: number];
  intensity: number;
  date: string;
  description: string;
};

// Simulated UFO sightings data covering various global locations
const UFO_SIGHTINGS: UfoSighting[] = [
  {
    name: "Roswell",
    coordinates: [-104.5230, 33.3943],
    intensity: 100,
    date: "1947-07-08",
    description: "The most famous UFO crash incident, widely considered the start of modern UFO lore."
  },
  {
    name: "Area 51",
    coordinates: [-115.7930, 37.2431],
    intensity: 90,
    date: "1955-05-25",
    description: "A secretive US military base often associated with alien technology and UFO research."
  },
  {
    name: "Phoenix Lights",
    coordinates: [-112.0740, 33.4484],
    intensity: 85,
    date: "1997-03-13",
    description: "A mass UFO sighting over Phoenix, Arizona witnessed by thousands."
  },
  {
    name: "Rendlesham Forest",
    coordinates: [1.4543, 52.0931],
    intensity: 80,
    date: "1980-12-26",
    description: "A well-documented UFO incident involving military personnel in England."
  },
  {
    name: "Ariel School",
    coordinates: [31.1469, -17.3333],
    intensity: 75,
    date: "1994-09-16",
    description: "A mass sighting by schoolchildren in Zimbabwe who claimed to see beings and a UFO."
  },
  {
    name: "Westall",
    coordinates: [145.1300, -37.9333],
    intensity: 70,
    date: "1966-04-06",
    description: "A mass UFO sighting in Melbourne, Australia, with over 200 witnesses, including students and teachers."
  },
  {
    name: "Tehran",
    coordinates: [51.3890, 35.6892],
    intensity: 65,
    date: "1976-09-19",
    description: "A UFO sighting over Tehran, Iran, where military jets were scrambled to intercept an unidentified object."
  },
  {
    name: "Varginha",
    coordinates: [-45.9333, -21.5500],
    intensity: 60,
    date: "1996-01-20",
    description: "A UFO sighting in Varginha, Brazil, involving multiple witnesses, including police officers and military personnel."
  },
  {
    name: "Belgian Wave",
    coordinates: [4.3517, 50.8503],
    intensity: 55,
    date: "1989-11-29",
    description: "A series of UFO sightings in Belgium, with radar confirmation and military involvement in tracking the objects."
  },
  {
    name: "Colares",
    coordinates: [-48.2800, -0.9300],
    intensity: 50,
    date: "1977-10-01",
    description: "A wave of UFO sightings in the Brazilian Amazon, including reports of physical effects on locals, such as burns."
  },
  {
    name: "The Battle of Los Angeles",
    coordinates: [-118.2437, 34.0522],
    intensity: 45,
    date: "1942-02-25",
    description: "A mysterious aerial event during World War II in Los Angeles, where anti-aircraft guns fired at unidentified objects."
  },
  {
    name: "McMinnville",
    coordinates: [-123.2645, 44.9429],
    intensity: 40,
    date: "1950-05-11",
    description: "One of the most famous UFO photographs, taken in McMinnville, Oregon, depicting a disc-shaped object."
  },
  {
    name: "The Flatwoods Monster",
    coordinates: [-80.3950, 38.7211],
    intensity: 35,
    date: "1952-09-12",
    description: "A sighting of a strange creature in Flatwoods, West Virginia, accompanied by reports of a UFO landing."
  },
  {
    name: "Shag Harbor",
    coordinates: [-62.1445, 44.5210],
    intensity: 30,
    date: "1967-10-04",
    description: "A UFO sighting off the coast of Shag Harbor, Nova Scotia, where a craft was seen to crash into the water."
  },
  {
    name: "The 1980 Allagash Abductions",
    coordinates: [-70.2825, 45.1583],
    intensity: 25,
    date: "1980-08-20",
    description: "A reported abduction incident in Allagash, Maine, where four men experienced missing time and strange phenomena."
  },
  {
    name: "The Kelly–Hopkinsville Encounter",
    coordinates: [-87.7418, 37.1547],
    intensity: 20,
    date: "1955-08-21",
    description: "An encounter in Kentucky where a family reported being attacked by small humanoid creatures, later dubbed 'goblins.'"
  },
  {
    name: "The Maury Island Incident",
    coordinates: [-122.5620, 47.4456],
    intensity: 15,
    date: "1947-06-21",
    description: "The first UFO sighting reported after Roswell, where two men reported seeing a flying saucer near Maury Island."
  }
];

export default function UfoSightingPage() {
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [initialViewState, setInitialViewState] = useState({longitude: UFO_SIGHTINGS[0].coordinates[0], latitude: UFO_SIGHTINGS[0].coordinates[1], zoom: 15, pitch: 70});

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };

  const flyToCity = useCallback((index: number) => {
    setInitialViewState({
      longitude: UFO_SIGHTINGS[index].coordinates[0],
      latitude: UFO_SIGHTINGS[index].coordinates[1],
      zoom: 15,
      pitch: 70,
      // @ts-expect-error TODO: fix this
      transitionInterpolator: new FlyToInterpolator({ speed: 4 }),
      transitionDuration: 'auto',
    });
  }, []);
  
  const layers = [
      new ScenegraphLayer<UfoSighting>({
        id: 'ufo-sightings',
        data: UFO_SIGHTINGS,
        pickable: true,
        scenegraph: 'https://storage.googleapis.com/raster-datasources/UFO%203D%20Model%20by%20Graphfun.glb',
        getPosition: d => d.coordinates,
        getOrientation: [0, Math.random() * 180, 90],
        sizeScale: 5,
        _animations: {
          '*': { speed: 5 }
        },
        _lighting: 'pbr',
        getColor: d => [128 + (d.intensity), 128, 255],
      })
  ];

  return (
    <main className="w-screen h-screen relative" onContextMenu={(evt) => evt.preventDefault()}>
      <DeckGL
        initialViewState={initialViewState}
        controller={{
          doubleClickZoom: false,
          touchRotate: true,
          dragRotate: true,
        }}
        layers={layers}
        getTooltip={({ object }: PickingInfo<UfoSighting>) =>
          object
            ? `Name: ${object.name}\nDate: ${object.date}\nDescription: ${object.description}`
            : null
        }
      >
        <MaplibreGL
          mapStyle={MAP_STYLES[currentMapStyle].url}
          attributionControl={false}
        />
      </DeckGL>

      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded max-h-96 overflow-y-auto">
        <h3 className="text-lg font-bold mb-2">UFO Sightings</h3>
        <ul className="space-y-2">
          {UFO_SIGHTINGS.map((sight, index) => (
            <li
              key={sight.name}
              onClick={() => flyToCity(index)}
              className="cursor-pointer hover:bg-white hover:text-black px-2 py-1 rounded"
            >
              {sight.name}
            </li>
          ))}
        </ul>
      </div>

      {/* return button */}
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
}
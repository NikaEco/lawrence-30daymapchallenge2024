'use client';

import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { Map as MaplibreGL } from 'react-map-gl/maplibre';
import { MAPBOX_ACCESS_TOKEN } from '@/app/env';
import { BitmapLayer, MapViewState } from 'deck.gl';
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

const BOUNDS = [
  -60.23015333811727,
  -3.3430803298507996,
  -60.20293438500845,
  -3.315861376741978
];

const INITIAL_VIEW_STATE = {
  longitude: (BOUNDS[0] + BOUNDS[2]) / 2,
  latitude: (BOUNDS[1] + BOUNDS[3]) / 2,
  zoom: 13,  // Adjust this value to get the desired initial zoom level
  pitch: 0,
  bearing: 0
};

interface Histogram {
  counts: number[];
  bins: number[];
}

interface BandStatistics {
  min: number;
  max: number;
  mean: number;
  count: number;
  sum: number;
  std: number;
  median: number;
  majority: number;
  minority: number;
  unique: number;
  histogram: Histogram;
  valid_percent: number;
  masked_pixels: number;
  valid_pixels: number;
  percentile_2: number;
  percentile_98: number;
}

interface COGStatistics {
  [bandName: string]: BandStatistics;
}

interface COGTilesProps {
  url: string;
  bidx: string[];
  expression: string;
  nodata: string | number;
  unscale: boolean;
  resampling: string;
  reproject: string;
  rescale: [number, number][];
  color_formula: string;
  colormap: string;
  colormap_name: string; // the list are in ./constants.ts
  return_mask: boolean;
  buffer: number;
  padding: number;
  algorithm: string;
  algorithm_params: string;
}

const START_YEAR = 1984;
const END_YEAR = 2023;

async function fetchTileStatistics(
  url: string,
  props: Record<string, string> = {},
) {
  const baseUrl = new URL(`${process.env.NEXT_PUBLIC_RASTER_SERVER}/cog/statistics`);

  baseUrl.searchParams.append('url', url);

  // Add any additional parameters from props
  Object.entries(props).forEach(([key, value]) => {
      if (!value) return;
      baseUrl.searchParams.append(key, value);
  });

  const response = await fetch(baseUrl.toString());

  if (!response.ok) {
      throw new Error(
          `Failed to fetch tile statistics: ${response.statusText}`,
      );
  }

  const stats = (await response.json()) as COGStatistics;

  return stats;
}

function isEmptyValue(value: string | number | boolean | string[] | [number, number][]): boolean {
  return (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

// This function is created to create an url string that follows /cog/tiles endpoint from Titiler at https://developmentseed.org/titiler/endpoints/cog/#tiles
function createTitilerUrl(props: Partial<COGTilesProps>): string {
  const urlSearchParams = new URLSearchParams();

  Object.entries(props).forEach(([key, value]) => {
      urlSearchParams.delete(key); // unset the field first, regardless whether value contains something

      if (isEmptyValue(value)) return;

      switch (key) {
          case 'bidx':
              if (Array.isArray(value)) {
                  value.forEach((v) =>
                      urlSearchParams.append(key, (v as string).charAt(1)),
                  );
              }
              break;
          case 'rescale':
              if (Array.isArray(value)) {
                  value.forEach((range) => {
                      if (range.length !== 2) return;
                      // @ts-expect-error TODO to fix
                      urlSearchParams.append(key, range.join(','));
                  });
              }
              break;
          case 'algorithm_params':
              if (typeof value === 'object') {
                  urlSearchParams.set(key, JSON.stringify(value));
              } else if (typeof value === 'string' && value.trim() !== '') {
                  urlSearchParams.set(key, value);
              }
              break;
          case 'colormap':
              if (typeof value === 'object') {
                  urlSearchParams.set(key, JSON.stringify(value));
              }
              break;
          default:
              if (typeof value === 'string' && value.trim() !== '') {
                  urlSearchParams.set(key, value);
              } else if (
                  typeof value === 'number' ||
                  typeof value === 'boolean'
              ) {
                  urlSearchParams.set(key, value.toString());
              }
      }
  });

  // Rebuild the URL with the original path and modified query parameters
  return `${process.env.NEXT_PUBLIC_RASTER_SERVER}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?${urlSearchParams.toString()}`;
}

const MapTimeSeries: React.FC = () => {
  const [currentMapStyle, setCurrentMapStyle] = useState(0);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [currentYear, setCurrentYear] = useState<number>(START_YEAR);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tileUrl, setTileUrl] = useState<string>('');

  const cycleMapStyle = () => {
    setCurrentMapStyle((prev) => (prev + 1) % MAP_STYLES.length);
  };
  
  // Create a single reusable layer
  const layer = new TileLayer({
    id: 'tile-layer',
    data: tileUrl,
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    extent: BOUNDS,
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
    onTileLoad: () => {
      setIsLoading(false);
    },
    onTileError: (error) => {
      console.error('Tile error:', error);
      setIsLoading(false);
    }
  });

  // Effect to update tile URL when year changes
  useEffect(() => {
    const updateTileUrl = async () => {
      setIsLoading(true);
      try {
        const gcsPath = `gs://planetgpt/50ae81ce-deac-45a1-a5b8-70af7615a39d/amazon_river_bend_landsat/landsat_${currentYear}/LANDSAT_LT05_${currentYear}_SWIR_NIR_RED_enhanced.tif`;
        
        const stats = await fetchTileStatistics(gcsPath);
        const bands = Object.keys(stats) || [];
        
        if (bands.length === 0) {
          throw Error('No bands in the raster imagery!');
        }

        const selectedBands = bands.length >= 3 ? bands.slice(0, 3) : bands.slice(0, 1);
        const rescale: [number, number][] = bands.length >= 3
          ? [
              [stats[bands[0]].min, stats[bands[0]].max],
              [stats[bands[1]].min, stats[bands[1]].max],
              [stats[bands[2]].min, stats[bands[2]].max],
            ]
          : [[stats[bands[0]].min, stats[bands[0]].max]];

        const url = createTitilerUrl({
          url: gcsPath,
          bidx: selectedBands,
          rescale,
        });

        setTileUrl(url);
      } catch (error) {
        console.error('Error updating tile URL:', error);
        setIsLoading(false);
      }
    };

    updateTileUrl();
  }, [currentYear]);

  // Effect to handle auto-play
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isPlaying && !isLoading) {
      timeoutId = setTimeout(() => {
        setCurrentYear(year => year >= END_YEAR ? START_YEAR : year + 1);
      }, playSpeed);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPlaying, isLoading, playSpeed]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setCurrentYear(value);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <main className="w-screen h-screen relative">
      <DeckGL
        layers={[layer]}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState as MapViewState)}
        controller={true}
      >
        <MaplibreGL
          mapStyle={MAP_STYLES[currentMapStyle].url}
          attributionControl={false}
        />
      </DeckGL>
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isLoading ? 'bg-gray-400' : ''}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>
          
          <div className="flex-1 relative">
            <input
              type="range"
              min={START_YEAR}
              max={END_YEAR}
              value={currentYear}
              onChange={handleSliderChange}
              disabled={isLoading}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>{START_YEAR}</span>
              <span>{END_YEAR}</span>
            </div>
          </div>
          
          <div className="w-20 text-center font-mono text-lg font-semibold">
            {currentYear}
          </div>
        </div>
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
};

export default MapTimeSeries;

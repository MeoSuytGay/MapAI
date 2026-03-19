import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Box, RotateCw, RotateCcw, ChevronUp, ChevronDown, Compass } from 'lucide-react';

const CATEGORY_COLORS = {
  'food': '#ff9f43',
  'cafe': '#ee5253',
  'shop': '#54a0ff',
  'tourism': '#feca57',
  'attraction': '#feca57',
  'park': '#1dd1a1',
  'hospital': '#ff6b6b',
  'school': '#5f27cd',
  'default': '#8395a7'
};

const MapLibreView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({}); 
  const [is3D, setIs3D] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bearing, setBearing] = useState(0);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  // Cập nhật styleUrl theo yêu cầu
  const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

  const updateMarkers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const poiLayers = map.current.getStyle().layers.filter(l => 
      l.id.includes('poi') || l.id.includes('place') || l.id.includes('label')
    );
    const features = map.current.queryRenderedFeatures({ layers: poiLayers.map(l => l.id) });
    const newMarkerIds = new Set();

    features.forEach((feature) => {
      const { properties, geometry } = feature;
      if (!properties.name || geometry.type !== 'Point') return;
      const poiId = `${properties.name}-${geometry.coordinates[0]}-${geometry.coordinates[1]}`;
      newMarkerIds.add(poiId);

      if (!markersRef.current[poiId]) {
        const category = properties.class || 'default';
        const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['default'];
        const el = document.createElement('div');
        el.className = 'poi-marker';
        el.innerHTML = `
          <div class="group relative flex items-center justify-center pointer-events-auto">
            <div class="absolute -top-10 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap shadow-2xl pointer-events-none z-50">
              ${properties.name}
            </div>
            <div class="w-2.5 h-2.5 rounded-full border-2 border-white/80 shadow-lg cursor-pointer hover:scale-150 transition-transform" 
                 style="background-color: ${color}"></div>
          </div>
        `;
        const marker = new maplibregl.Marker({ element: el }).setLngLat(geometry.coordinates).addTo(map.current);
        markersRef.current[poiId] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!newMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  };

  useEffect(() => {
    if (!MAPTILER_KEY || map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [108.22, 16.06],
      zoom: 14,
      pitch: 0,
      antialias: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      map.current.addSource('maptiler-terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
        tileSize: 256
      });

      if (!map.current.getLayer('3d-buildings')) {
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 20],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.6
          }
        });
      }
      updateMarkers();
    });

    map.current.on('rotate', () => setBearing(map.current.getBearing()));
    map.current.on('moveend', updateMarkers);
    map.current.on('zoomend', updateMarkers);

    return () => map.current?.remove();
  }, [MAPTILER_KEY, styleUrl]);

  const toggle3D = () => {
    if (!map.current) return;
    if (!is3D) {
      map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });
      map.current.easeTo({ pitch: 65, bearing: -15, duration: 1200, zoom: 16 });
    } else {
      map.current.setTerrain(null);
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000, zoom: 14 });
    }
    setIs3D(!is3D);
  };

  const rotateMap = (delta) => map.current?.easeTo({ bearing: map.current.getBearing() + delta, duration: 300 });
  const pitchMap = (delta) => {
    const newPitch = Math.min(Math.max(map.current.getPitch() + delta, 0), 85);
    map.current.easeTo({ pitch: newPitch, duration: 300 });
  };

  return (
    <div className="relative w-full h-full bg-[#f8f9fa]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* View Toggle */}
      <div className="absolute bottom-8 left-8 z-20 flex flex-col gap-3">
        <button
          onClick={toggle3D}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md border shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${
            is3D ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {is3D ? <Box size={16} /> : <Layers size={16} />}
          {is3D ? '3D: ON' : '2D: ON'}
        </button>
      </div>

      {/* Camera Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-1.5 shadow-2xl">
          <button onClick={() => pitchMap(15)} className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"><ChevronUp size={18} /></button>
          <button onClick={() => rotateMap(-30)} className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"><RotateCcw size={18} /></button>
          <button onClick={() => map.current?.easeTo({bearing:0, pitch: is3D?60:0})} className="p-2.5 text-blue-400 hover:bg-white/10 rounded-xl transition-colors">
            <Compass size={18} style={{ transform: `rotate(${-bearing}deg)` }} />
          </button>
          <button onClick={() => rotateMap(30)} className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"><RotateCw size={18} /></button>
          <button onClick={() => pitchMap(-15)} className="p-2.5 text-white hover:bg-white/10 rounded-xl transition-colors"><ChevronDown size={18} /></button>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default MapLibreView;

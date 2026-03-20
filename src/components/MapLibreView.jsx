import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Box, RotateCw, RotateCcw, ChevronUp, ChevronDown, Compass, X, Star, MapPin, Phone, Globe, Clock, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlaceDetails } from '../services/serpApi';
import PlaceDetailPanel from './PlaceDetailPanel';

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
  const [searchParams] = useSearchParams();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({}); 
  const [is3D, setIs3D] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [mapError, setMapError] = useState(null);
  
  // State for place details
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  
  // Fallback to a free style if MapTiler key is missing or invalid
  const styleUrl = (MAPTILER_KEY && MAPTILER_KEY !== 'YOUR_MAPTILER_KEY_HERE')
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : 'https://demotiles.maplibre.org/style.json'; // Open source basic style

  const handleShowDetails = useCallback(async (name, coordinates) => {
    setIsDetailLoading(true);
    try {
      const details = await fetchPlaceDetails(name, coordinates);
      setSelectedPlace(details);
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  // Expose function to window for popup button access
  useEffect(() => {
    window.showPlaceDetails = (name, lng, lat) => {
      handleShowDetails(name, [lng, lat]);
    };
    return () => {
      delete window.showPlaceDetails;
    };
  }, [handleShowDetails]);

  const updateMarkers = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    const style = map.current.getStyle();
    if (!style || !style.layers) return;

    const poiLayers = style.layers.filter(l => 
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
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(geometry.coordinates)
          .addTo(map.current);
        markersRef.current[poiId] = marker;
      }
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!newMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, []);

  // Xử lý zoom tới tọa độ từ URL
  useEffect(() => {
    if (!isLoaded || !map.current) return;
    
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));

    if (!isNaN(lat) && !isNaN(lng)) {
      map.current.easeTo({
        center: [lng, lat],
        zoom: 17,
        pitch: 45,
        duration: 2000
      });

      // Thêm một marker đặc biệt cho địa điểm đang tìm kiếm
      const el = document.createElement('div');
      el.className = 'search-focus-marker';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-pulse"></div>
          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-2xl z-10"></div>
        </div>
      `;
      
      new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current);
    }
  }, [isLoaded, searchParams]);

  useEffect(() => {
    if (map.current) return;

    try {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [108.22, 16.06],
        zoom: 15,
        pitch: 0,
        antialias: true,
        doubleClickZoom: false,
        dragRotate: true
      });

      map.current = mapInstance;

      mapInstance.on('load', () => {
        setIsLoaded(true);
        setMapError(null);
        
        // Only add terrain if key is valid
        if (MAPTILER_KEY && MAPTILER_KEY !== 'YOUR_MAPTILER_KEY_HERE') {
          mapInstance.addSource('maptiler-terrain', {
            type: 'raster-dem',
            url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
            tileSize: 256
          });

          if (!mapInstance.getLayer('3d-buildings')) {
            mapInstance.addLayer({
              'id': '3d-buildings',
              'source': 'openmaptiles',
              'source-layer': 'building',
              'type': 'fill-extrusion',
              'minzoom': 14,
              'paint': {
                'fill-extrusion-color': '#e2e8f0',
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 20],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
                'fill-extrusion-opacity': 0.5
              }
            });
          }
        }
        updateMarkers();
      });

      mapInstance.on('error', (e) => {
        console.warn('MapLibre error (often related to API keys):', e);
        if (e.error && e.error.status === 403) {
          setMapError("API Key MapTiler không hợp lệ hoặc đã hết hạn (403).");
        }
      });

      mapInstance.on('click', (e) => {
        const width = 15; 
        const height = 15;
        const bbox = [
          [e.point.x - width, e.point.y - height],
          [e.point.x + width, e.point.y + height]
        ];

        const features = mapInstance.queryRenderedFeatures(bbox);
        const poi = features.find(f => f.layer.type === 'symbol' && f.properties && f.properties.name)
                 || features.find(f => f.properties && f.properties.name);

        if (!poi) return;

        const { properties } = poi;
        const name = properties.name || properties.name_en;
        const category = properties.class || properties.subclass || 'Địa điểm';

        const popupContent = `
          <div class="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl min-w-[200px] animate-in fade-in zoom-in duration-200">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              <span class="text-[9px] font-black uppercase tracking-widest text-blue-400">${category}</span>
            </div>
            <h3 class="text-sm font-bold mb-3 leading-tight">${name}</h3>
            <button 
              onclick="window.showPlaceDetails('${name}', ${e.lngLat.lng}, ${e.lngLat.lat})"
              class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all active:scale-95 uppercase"
            >
              XEM CHI TIẾT
            </button>
          </div>
        `;

        new maplibregl.Popup({ 
          offset: [0, -10], 
          closeButton: false,
          maxWidth: '300px'
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(mapInstance);
      });

      mapInstance.on('mousemove', (e) => {
        const p = 8;
        const features = mapInstance.queryRenderedFeatures([
          [e.point.x - p, e.point.y - p],
          [e.point.x + p, e.point.y + p]
        ]);
        const hasPoi = features.some(f => f.properties && f.properties.name);
        mapInstance.getCanvas().style.cursor = hasPoi ? 'pointer' : '';
      });

      mapInstance.on('rotate', () => {
        const newBearing = mapInstance.getBearing();
        setBearing(newBearing);
      });

      mapInstance.on('moveend', updateMarkers);
      mapInstance.on('zoomend', updateMarkers);

    } catch (err) {
      console.error("Map initialization failed:", err);
      setMapError("Không thể khởi tạo bản đồ. Vui lòng kiểm tra kết nối mạng hoặc API Key.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [MAPTILER_KEY, styleUrl, updateMarkers]);

  const rotateMap = (delta) => map.current?.easeTo({ bearing: map.current.getBearing() + delta, duration: 300 });
  const pitchMap = (delta) => {
    if (!map.current) return;
    const newPitch = Math.min(Math.max(map.current.getPitch() + delta, 0), 85);
    map.current.easeTo({ pitch: newPitch, duration: 300 });
  };

  const toggle3D = () => {
    if (!map.current) return;
    if (!is3D) {
      map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });
      map.current.easeTo({ pitch: 65, bearing: -15, duration: 1200, zoom: 16 });
    } else {
      map.current.setTerrain(null);
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 1000, zoom: 15 });
    }
    setIs3D(!is3D);
  };

  return (
    <div className="relative w-full h-full bg-[#f8f9fa] overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Place Detail Panel (Right Side) */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailPanel 
            place={selectedPlace} 
            onClose={() => setSelectedPlace(null)} 
          />
        )}
      </AnimatePresence>

      {/* Loading Details Spinner */}
      <AnimatePresence>
        {isDetailLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm z-[110] flex items-center justify-center"
          >
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Đang tải dữ liệu thực tế...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Toggle (Now on the Right) */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-3">
        <button
          onClick={toggle3D}
          className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] backdrop-blur-2xl border transition-all shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] ${
            is3D ? 'bg-slate-900 border-slate-700 text-white shadow-blue-500/10' : 'bg-white border-slate-200 text-slate-900 shadow-black/5'
          }`}
        >
          {is3D ? <Box size={18} className="animate-pulse" /> : <Layers size={18} />}
          {is3D ? 'Perspective: 3D' : 'View: 2D'}
        </button>
      </div>

      {/* Camera Controls (Now on the Left) */}
      <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-1.5 shadow-2xl">
          <button onClick={() => pitchMap(15)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><ChevronUp size={20} /></button>
          <button onClick={() => rotateMap(-30)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><RotateCcw size={20} /></button>
          <button onClick={() => map.current?.easeTo({bearing:0})} className="p-3 text-blue-400 hover:bg-white/10 rounded-2xl transition-colors">
            <Compass size={20} style={{ transform: `rotate(${-bearing}deg)` }} />
          </button>
          <button onClick={() => rotateMap(30)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><RotateCw size={20} /></button>
          <button onClick={() => pitchMap(-15)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><ChevronDown size={20} /></button>
        </div>
      </div>

      {!isLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50 p-10 text-center">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <X size={32} />
          </div>
          <h2 className="text-xl font-black mb-2">Lỗi Khởi Tạo Bản Đồ</h2>
          <p className="text-slate-400 max-w-md mb-8">{mapError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all"
          >
            Thử lại
          </button>
        </div>
      )}

      <style>{`
        .maplibregl-popup-content { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: rgba(15, 23, 42, 0.9) !important; }
        .maplibregl-canvas-container.maplibregl-interactive { cursor: default; }
      `}</style>
    </div>
  );
};

export default MapLibreView;

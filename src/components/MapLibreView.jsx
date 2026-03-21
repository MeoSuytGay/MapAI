import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Box, RotateCw, RotateCcw, ChevronUp, ChevronDown, Compass, X, Star, MapPin, Phone, Globe, Clock, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, MessageSquare, Navigation } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPlaceDetails } from '../services/serpApi';
import PlaceDetailPanel from './PlaceDetailPanel';
import DirectionsPanel from './DirectionsPanel';
import { useToast } from '../context/ToastContext';

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
  const routeMarkersRef = useRef([]);
  const [is3D, setIs3D] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [mapError, setMapError] = useState(null);
  
  // State for place details
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // State for directions
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [initialOrigin, setInitialOrigin] = useState(null);
  const [initialDestination, setInitialDestination] = useState(null);

  const { addToast, removeToast } = useToast();

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  
  const styleUrl = (MAPTILER_KEY && MAPTILER_KEY !== 'YOUR_MAPTILER_KEY_HERE')
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : 'https://demotiles.maplibre.org/style.json';

  const handleShowDetails = useCallback(async (name, coordinates) => {
    setIsDetailLoading(true);
    try {
      const details = await fetchPlaceDetails(name, coordinates);
      setSelectedPlace(details);
    } catch (error) {
      console.error("Failed to load details", error);
      addToast("Không thể tải thông tin địa điểm", "error");
    } finally {
      setIsDetailLoading(false);
    }
  }, [addToast]);

  const clearRoute = useCallback(() => {
    if (!map.current) return;
    if (map.current.getLayer('route-line')) map.current.removeLayer('route-line');
    if (map.current.getLayer('route-line-casing')) map.current.removeLayer('route-line-casing');
    if (map.current.getSource('route')) map.current.removeSource('route');
    
    routeMarkersRef.current.forEach(m => m.remove());
    routeMarkersRef.current = [];
    setRouteInfo(null);
  }, []);

  const handleRouteSelected = async (origin, destination, mode = 'driving') => {
    if (!map.current) return;
    
    const loadingToastId = addToast(`Đang tìm tuyến đường cho ${mode === 'driving' ? 'ô tô' : mode === 'bicycle' ? 'xe đạp' : 'người đi bộ'}...`, "loading", Infinity);

    try {
      // Map mode to correct server prefix for routing.openstreetmap.de
      const serverPrefix = mode === 'driving' ? 'routed-car' : mode === 'bicycle' ? 'routed-bike' : 'routed-foot';
      // Profile names in URL: driving, bicycle, foot
      const profile = mode; 

      const url = `https://routing.openstreetmap.de/${serverPrefix}/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ chỉ đường.");
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('Không tìm thấy tuyến đường khả thi giữa hai điểm này.');
      }

      const route = data.routes[0];
      const geometry = route.geometry;

      if (!geometry) {
        throw new Error('Dữ liệu tọa độ tuyến đường bị thiếu.');
      }

      clearRoute();

      // Thêm Source và Layer
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: geometry
        }
      });

      // Viền cho đường đi (Casing)
      map.current.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#1e40af',
          'line-width': 12,
          'line-opacity': 0.3
        }
      });

      // Đường đi chính
      map.current.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 6
        }
      });

      // Thêm Marker cho điểm đầu và cuối
      const startEl = document.createElement('div');
      startEl.className = 'w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white';
      startEl.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>';
      
      const endEl = document.createElement('div');
      endEl.className = 'w-8 h-8 bg-rose-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white';
      endEl.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

      const startMarker = new maplibregl.Marker({ element: startEl }).setLngLat([origin.lng, origin.lat]).addTo(map.current);
      const endMarker = new maplibregl.Marker({ element: endEl }).setLngLat([destination.lng, destination.lat]).addTo(map.current);
      
      routeMarkersRef.current = [startMarker, endMarker];

      // Fit map to route
      const coordinates = geometry.coordinates;
      const bounds = coordinates.reduce((acc, coord) => {
        return acc.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
      setRouteInfo(route);
      
      removeToast(loadingToastId);
      addToast("Đã tìm thấy tuyến đường!", "success");

    } catch (error) {
      console.error("Routing error:", error);
      removeToast(loadingToastId);
      addToast(error.message, "error");
    }
  };

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
            <div class="grid grid-cols-2 gap-2">
              <button 
                onclick="window.showPlaceDetails('${name}', ${e.lngLat.lng}, ${e.lngLat.lat})"
                class="py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black rounded-lg transition-all active:scale-95 uppercase"
              >
                CHI TIẾT
              </button>
              <button 
                onclick="window.startDirectionsFromPopup('${name}', ${e.lngLat.lng}, ${e.lngLat.lat})"
                class="py-2 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black rounded-lg transition-all active:scale-95 uppercase flex items-center justify-center gap-1"
              >
                ĐƯỜNG ĐI
              </button>
            </div>
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

      // Add popup function to window
      window.startDirectionsFromPopup = (name, lng, lat) => {
        const origin = { name, lng, lat };
        setInitialOrigin({...origin}); // Tạo object mới để trigger useEffect ở con
        setInitialDestination(null);
        setIsDirectionsMode(true);
      };

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

      {/* Directions Panel */}
      <AnimatePresence>
        {isDirectionsMode && (
          <DirectionsPanel 
            initialOrigin={initialOrigin}
            initialDestination={initialDestination}
            routeInfo={routeInfo}
            onBack={() => {
              setIsDirectionsMode(false);
              clearRoute();
              setInitialOrigin(null);
              setInitialDestination(null);
            }}
            onRouteSelected={handleRouteSelected}
          />
        )}
      </AnimatePresence>

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

      {/* Quick Actions (Floating) */}
      <div className="absolute top-10 left-10 z-20 flex flex-col gap-3">
        {!isDirectionsMode && (
          <button
            onClick={() => setIsDirectionsMode(true)}
            className="flex items-center gap-4 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-[2rem] shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 active:scale-95"
          >
            <Navigation size={18} className="text-blue-600" />
            Chỉ đường
          </button>
        )}
      </div>

      {/* View & Camera Controls (Bottom Right) */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-3 items-end">
        {/* Camera Controls */}
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-1.5 shadow-2xl w-fit">
          <button onClick={() => pitchMap(15)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><ChevronUp size={20} /></button>
          <button onClick={() => rotateMap(-30)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><RotateCcw size={20} /></button>
          <button onClick={() => map.current?.easeTo({bearing:0})} className="p-3 text-blue-400 hover:bg-white/10 rounded-2xl transition-colors">
            <Compass size={20} style={{ transform: `rotate(${-bearing}deg)` }} />
          </button>
          <button onClick={() => rotateMap(30)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><RotateCw size={20} /></button>
          <button onClick={() => pitchMap(-15)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><ChevronDown size={20} /></button>
        </div>

        {/* 2D/3D Toggle */}
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

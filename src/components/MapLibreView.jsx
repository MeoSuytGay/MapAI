import React, { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Box, RotateCw, RotateCcw, ChevronUp, ChevronDown, Compass, X, Star, MapPin, Phone, Globe, Clock, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, MessageSquare, Navigation, LocateFixed } from 'lucide-react';
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

const MapLibreView = ({ mapRef, isDirectionsMode, setIsDirectionsMode, isNavigating, setIsNavigating }) => {
  const [searchParams] = useSearchParams();
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Cung cấp các phương thức điều khiển bản đồ cho component cha (MapPage)
  useImperativeHandle(mapRef, () => ({
    flyTo: (options) => {
      if (map.current) {
        map.current.flyTo(options);
      }
    },
    getMap: () => map.current
  }));

  const markersRef = useRef({}); 
  const routeMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [is3D, setIs3D] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bearing, setBearing] = useState(0);
  const [mapError, setMapError] = useState(null);
  
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [routeInfo, setRouteInfo] = useState(null);
  const [initialOrigin, setInitialOrigin] = useState(null);
  const [initialDestination, setInitialDestination] = useState(null);

  const { addToast, removeToast } = useToast();

  // Tự động di chuyển camera khi URL có tọa độ (từ SearchBar)
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng && map.current) {
      map.current.flyTo({
        center: [parseFloat(lng), parseFloat(lat)],
        zoom: 16,
        essential: true,
        duration: 3000
      });
      
      // Có thể thêm marker tạm thời tại đây nếu cần
    }
  }, [searchParams, isLoaded]);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      addToast("Trình duyệt không hỗ trợ định vị.", "error");
      return;
    }

    const loadingId = addToast("Đang xác định vị trí của bạn...", "loading", Infinity);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        removeToast(loadingId);

        if (!map.current) return;

        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 17,
          essential: true,
          duration: 2000
        });

        if (userMarkerRef.current) userMarkerRef.current.remove();

        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center';
        el.innerHTML = `
          <div class="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="relative w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
        `;

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Lưu vị trí vào sessionStorage để dùng cho các chức năng khác (ví dụ: chỉ đường)
        const userLoc = {
          name: "Vị trí của tôi",
          lng: longitude,
          lat: latitude,
          timestamp: Date.now()
        };
        sessionStorage.setItem('user_location', JSON.stringify(userLoc));

        addToast("Đã định vị và lưu vị trí của bạn!", "success");
      },
      (error) => {
        removeToast(loadingId);
        addToast(error.code === 1 ? "Vui lòng cho phép quyền truy cập vị trí." : "Không thể lấy vị trí.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [addToast, removeToast]);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim();
  
  const styleUrl = (MAPTILER_KEY && MAPTILER_KEY !== 'YOUR_MAPTILER_KEY_HERE')
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
    : 'https://demotiles.maplibre.org/style.json';

  const handleStartNavigation = useCallback(() => {
    if (!map.current || !routeInfo || !routeInfo.geometry) return;
    
    const coords = routeInfo.geometry.coordinates;
    if (coords.length < 2) return;

    addToast("Bắt đầu dẫn đường 3D...", "success");

    const lon1 = coords[0][0];
    const lat1 = coords[0][1];
    const lon2 = coords[1][0];
    const lat2 = coords[1][1];

    const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    brng = (brng + 360) % 360;

    if (!is3D) {
      if (map.current.getSource('maptiler-terrain')) {
        map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 });
      }
      setIs3D(true);
    }

    map.current.flyTo({
      center: [lon1, lat1],
      zoom: 19,
      pitch: 80,
      bearing: brng,
      duration: 4000,
      essential: true,
      curve: 1.5,
      speed: 0.8
    });
  }, [routeInfo, is3D, addToast]);

  const handleMoveToStep = useCallback((index) => {
    if (!map.current || !routeInfo || !routeInfo.legs?.[0]?.steps?.[index]) return;
    
    const steps = routeInfo.legs[0].steps;
    const currentStep = steps[index];
    const nextStep = steps[index + 1];
    
    const lon1 = currentStep.maneuver.location[0];
    const lat1 = currentStep.maneuver.location[1];
    
    let targetBearing = map.current.getBearing();
    
    if (nextStep) {
      const lon2 = nextStep.maneuver.location[0];
      const lat2 = nextStep.maneuver.location[1];
      
      const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
      const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
      targetBearing = Math.atan2(y, x) * 180 / Math.PI;
    }

    map.current.flyTo({
      center: [lon1, lat1],
      zoom: 18,
      pitch: 75,
      bearing: targetBearing,
      duration: 1500,
      essential: true
    });
  }, [routeInfo]);

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
    const loadingToastId = addToast(`Đang tìm tuyến đường...`, "loading", Infinity);
    try {
      const serverPrefix = mode === 'driving' ? 'routed-car' : mode === 'bicycle' ? 'routed-bike' : 'routed-foot';
      const url = `https://routing.openstreetmap.de/${serverPrefix}/route/v1/${mode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể kết nối đến máy chủ chỉ đường.");
      const data = await response.json();
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) throw new Error('Không tìm thấy tuyến đường.');
      
      const route = data.routes[0];
      clearRoute();
      map.current.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: route.geometry } });
      map.current.addLayer({
        id: 'route-line-casing', type: 'line', source: 'route',
        paint: { 'line-color': '#1e40af', 'line-width': 12, 'line-opacity': 0.3 }
      });
      map.current.addLayer({
        id: 'route-line', type: 'line', source: 'route',
        paint: { 'line-color': '#3b82f6', 'line-width': 6 }
      });

      const startMarker = new maplibregl.Marker({ element: createMarkerElement('start') }).setLngLat([origin.lng, origin.lat]).addTo(map.current);
      const endMarker = new maplibregl.Marker({ element: createMarkerElement('end') }).setLngLat([destination.lng, destination.lat]).addTo(map.current);
      routeMarkersRef.current = [startMarker, endMarker];


      const bounds = route.geometry.coordinates.reduce((acc, coord) => acc.extend(coord), new maplibregl.LngLatBounds(route.geometry.coordinates[0], route.geometry.coordinates[0]));
      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
      setRouteInfo(route);
      removeToast(loadingToastId);
      addToast("Đã tìm thấy tuyến đường!", "success");
    } catch (error) {
      removeToast(loadingToastId);
      addToast(error.message, "error");
    }
  };

  const createMarkerElement = (type) => {
    const el = document.createElement('div');
    if (type === 'start') {
      el.className = 'w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white';
      el.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>';
    } else {
      el.className = 'w-8 h-8 bg-rose-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white';
      el.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
    }
    return el;
  };

  useEffect(() => {
    window.showPlaceDetails = (name, lng, lat) => handleShowDetails(name, [lng, lat]);
    window.startDirectionsFromPopup = (name, lng, lat) => {
      // Khi bắt đầu từ popup, lấy vị trí hiện tại làm điểm đi (nếu có) và địa điểm này làm điểm đến
      const savedLoc = sessionStorage.getItem('user_location');
      if (savedLoc) {
        setInitialOrigin(JSON.parse(savedLoc));
      }
      setInitialDestination({ name, lng, lat });
      setIsDirectionsMode(true);
    };
    return () => {
      delete window.showPlaceDetails;
      delete window.startDirectionsFromPopup;
    };
  }, [handleShowDetails, setIsDirectionsMode]);

  // Tự động nhận vị trí hiện tại khi bật chế độ chỉ đường
  useEffect(() => {
    if (isDirectionsMode && !initialOrigin && !isNavigating) {
      const savedLoc = sessionStorage.getItem('user_location');
      if (savedLoc) {
        setInitialOrigin(JSON.parse(savedLoc));
      } else {
        // Nếu chưa có trong session, thử định vị tự động
        handleLocateUser();
      }
    }
  }, [isDirectionsMode, initialOrigin, isNavigating, handleLocateUser]);

  const updateMarkers = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    const features = map.current.queryRenderedFeatures({ layers: map.current.getStyle().layers.filter(l => l.id.includes('poi') || l.id.includes('place')).map(l => l.id) });
    const newMarkerIds = new Set();
    features.forEach((feature) => {
      if (!feature.properties.name || feature.geometry.type !== 'Point') return;
      const id = `${feature.properties.name}-${feature.geometry.coordinates.join('-')}`;
      newMarkerIds.add(id);
      if (!markersRef.current[id]) {
        const color = CATEGORY_COLORS[feature.properties.class] || CATEGORY_COLORS.default;
        const el = document.createElement('div');
        el.innerHTML = `<div class="w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-150 transition-transform" style="background-color: ${color}"></div>`;
        markersRef.current[id] = new maplibregl.Marker({ element: el }).setLngLat(feature.geometry.coordinates).addTo(map.current);
      }
    });
    Object.keys(markersRef.current).forEach(id => { if (!newMarkerIds.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; } });
  }, []);

  useEffect(() => {
    if (map.current) return;
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: [108.22, 16.06],
        zoom: 15,
        pitch: 0,
        antialias: true
      });

      map.current.on('load', () => {
        setIsLoaded(true);
        if (MAPTILER_KEY) {
          map.current.addSource('maptiler-terrain', { type: 'raster-dem', url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`, tileSize: 256 });
        }
        updateMarkers();
        map.current.resize();
      });

      map.current.on('error', (e) => {
        if (e.error?.status === 403) setMapError("API Key MapTiler không hợp lệ.");
      });

      map.current.on('click', (e) => {
        const poi = map.current.queryRenderedFeatures([ [e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10] ])
                       .find(f => f.properties?.name);
        if (!poi) return;
        const { properties } = poi;
        const popupContent = `
          <div class="relative p-4 bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl min-w-[220px]">
            <button onclick="this.closest('.maplibregl-popup').remove()" class="absolute top-2 right-2 p-1 text-white/40 hover:text-white">✕</button>
            <h3 class="text-sm font-bold mb-3">${properties.name}</h3>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="window.showPlaceDetails('${properties.name}', ${e.lngLat.lng}, ${e.lngLat.lat})" class="py-2 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase">CHI TIẾT</button>
              <button onclick="window.startDirectionsFromPopup('${properties.name}', ${e.lngLat.lng}, ${e.lngLat.lat})" class="py-2 bg-slate-800 text-white text-[9px] font-black rounded-lg uppercase">ĐƯỜNG ĐI</button>
            </div>
          </div>
        `;
        document.querySelectorAll('.maplibregl-popup').forEach(p => p.remove());
        new maplibregl.Popup({ offset: [0, -10], closeButton: false }).setLngLat(e.lngLat).setHTML(popupContent).addTo(map.current);
      });

      map.current.on('rotate', () => setBearing(map.current.getBearing()));
      map.current.on('moveend', updateMarkers);
    } catch (err) {
      setMapError("Không thể khởi tạo bản đồ.");
    }
    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [MAPTILER_KEY, styleUrl, updateMarkers]);

  const handleMoveCamera = useCallback((direction) => {
    if (!map.current) return;
    const center = map.current.getCenter();
    const bearing = map.current.getBearing();
    const zoom = map.current.getZoom();
    const step = 0.0001 * (Math.pow(2, 20 - zoom)); 
    const rad = bearing * Math.PI / 180;

    switch (direction) {
      case 'forward':
        map.current.easeTo({ center: [center.lng + step * Math.sin(rad), center.lat + step * Math.cos(rad)], duration: 200 });
        break;
      case 'backward':
        map.current.easeTo({ center: [center.lng - step * Math.sin(rad), center.lat - step * Math.cos(rad)], duration: 200 });
        break;
      case 'left':
        map.current.easeTo({ bearing: bearing - 15, duration: 200 });
        break;
      case 'right':
        map.current.easeTo({ bearing: bearing + 15, duration: 200 });
        break;
    }
  }, []);

  useEffect(() => {
    if (map.current) {
      const timer = setTimeout(() => map.current.resize(), 300);
      return () => clearTimeout(timer);
    }
  }, [isDirectionsMode]);

  return (
    <div className="relative w-full h-full bg-[#0f172a] overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      <AnimatePresence>
        {isDirectionsMode && (
          <DirectionsPanel 
            initialOrigin={initialOrigin} initialDestination={initialDestination} routeInfo={routeInfo}
            isNavigating={isNavigating}
            onStartNavigation={() => {
              handleStartNavigation();
              setIsNavigating(true);
            }}
            onStopNavigation={() => setIsNavigating(false)}
            onMoveCamera={handleMoveCamera}
            onMoveToStep={handleMoveToStep}
            onBack={() => { 
              setIsDirectionsMode(false); 
              setIsNavigating(false);
              clearRoute(); 
              setInitialOrigin(null); 
              setInitialDestination(null); 
            }}
            onRouteSelected={handleRouteSelected}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedPlace && <PlaceDetailPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {isDetailLoading && (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm z-[110] flex items-center justify-center">
            <div className="bg-slate-900/80 p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Đang tải...</p>
            </div>
          </div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-3 items-end">
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-1.5 shadow-2xl w-fit">
          <button onClick={() => map.current?.easeTo({ pitch: Math.min(map.current.getPitch() + 15, 85) })} className="p-3 text-white hover:text-blue-400 transition-colors"><ChevronUp size={20} /></button>
          <button onClick={() => map.current?.easeTo({ bearing: map.current.getBearing() - 30 })} className="p-3 text-white hover:text-blue-400 transition-colors"><RotateCcw size={20} /></button>
          
          <button 
            onClick={handleLocateUser} 
            className="p-3 text-emerald-400 hover:bg-white/5 rounded-full transition-all"
            title="Vị trí của tôi"
          >
            <LocateFixed size={20} />
          </button>

          <button onClick={() => map.current?.easeTo({ bearing: 0, pitch: 0 })} className="p-3 text-blue-400 hover:scale-110 transition-all"><Compass size={20} style={{ transform: `rotate(${-bearing}deg)` }} /></button>
          <button onClick={() => map.current?.easeTo({ bearing: map.current.getBearing() + 30 })} className="p-3 text-white hover:text-blue-400 transition-colors"><RotateCw size={20} /></button>
          <button onClick={() => map.current?.easeTo({ pitch: Math.max(map.current.getPitch() - 15, 0) })} className="p-3 text-white hover:text-blue-400 transition-colors"><ChevronDown size={20} /></button>
        </div>
        <button onClick={() => {
          if (!is3D) { map.current.setTerrain({ source: 'maptiler-terrain', exaggeration: 1.5 }); map.current.easeTo({ pitch: 65, zoom: 16 }); }
          else { map.current.setTerrain(null); map.current.easeTo({ pitch: 0, zoom: 15 }); }
          setIs3D(!is3D);
        }} className={`flex items-center gap-4 px-8 py-4 rounded-[2rem] backdrop-blur-2xl border transition-all shadow-2xl font-black text-[10px] uppercase tracking-[0.2em] ${is3D ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
          {is3D ? <Box size={18} /> : <Layers size={18} />} {is3D ? 'Perspective: 3D' : 'View: 2D'}
        </button>
      </div>
      {!isLoaded && !mapError && <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50"><div className="w-10 h-10 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin"></div></div>}
      {mapError && <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50 p-10 text-center"><h2 className="text-xl font-black mb-2">Lỗi</h2><p className="text-slate-400 mb-8">{mapError}</p><button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 rounded-xl uppercase">Thử lại</button></div>}
      <style>{`.maplibregl-popup-content { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }`}</style>
    </div>
  );
};

export default MapLibreView;

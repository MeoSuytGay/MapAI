import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Box, RotateCw, RotateCcw, ChevronUp, ChevronDown, Compass } from 'lucide-react';

const MapLibreView = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [is3D, setIs3D] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bearing, setBearing] = useState(0);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

  useEffect(() => {
    if (!MAPTILER_KEY || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: [108.22, 16.06],
      zoom: 15,
      pitch: 0,
      antialias: true,
      doubleClickZoom: false, // Vô hiệu hóa để ưu tiên click POI
      dragRotate: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Thêm Terrain cho 3D
      map.current.addSource('maptiler-terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
        tileSize: 256
      });

      // Layer Tòa nhà 3D
      if (!map.current.getLayer('3d-buildings')) {
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 14,
          'paint': {
            'fill-extrusion-color': '#e2e8f0',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 20],
            'fill-extrusion-opacity': 0.5
          }
        });
      }
    });

    // CHIẾN THUẬT CLICK "BẮT DÍNH" ICON (FIX LỖI CLICK KHÔNG TRÚNG)
    map.current.on('click', (e) => {
      // 1. Tạo Hitbox rộng (30x30 pixel) quanh đầu chuột
      const width = 15; // 15px mỗi bên
      const height = 15;
      const bbox = [
        [e.point.x - width, e.point.y - height],
        [e.point.x + width, e.point.y + height]
      ];

      // 2. Quét tất cả các đối tượng render trong vùng 30px này
      const features = map.current.queryRenderedFeatures(bbox);

      // 3. Tìm đối tượng có tên (name) và ưu tiên lớp Symbol (Icon địa điểm)
      const poi = features.find(f => f.layer.type === 'symbol' && f.properties && f.properties.name)
               || features.find(f => f.properties && f.properties.name);

      if (!poi) return;

      const { properties } = poi;
      const name = properties.name || properties.name_en;
      const category = properties.class || properties.subclass || 'Địa điểm';

      // 4. Hiển thị Popup
      const popupContent = `
        <div class="p-4 bg-slate-900 text-white rounded-2xl border border-white/10 shadow-2xl min-w-[200px] animate-in fade-in zoom-in duration-200">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <span class="text-[9px] font-black uppercase tracking-widest text-blue-400">${category}</span>
          </div>
          <h3 class="text-sm font-bold mb-3 leading-tight">${name}</h3>
          <button class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all active:scale-95 uppercase">
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
        .addTo(map.current);
    });

    // Cập nhật con trỏ chuột cực nhạy (quét vùng 16px quanh chuột)
    map.current.on('mousemove', (e) => {
      const p = 8;
      const features = map.current.queryRenderedFeatures([
        [e.point.x - p, e.point.y - p],
        [e.point.x + p, e.point.y + p]
      ]);
      const hasPoi = features.some(f => f.properties && f.properties.name);
      map.current.getCanvas().style.cursor = hasPoi ? 'pointer' : '';
    });

    map.current.on('rotate', () => setBearing(map.current.getBearing()));

    return () => map.current?.remove();
  }, [MAPTILER_KEY, styleUrl]);

  const rotateMap = (delta) => map.current?.easeTo({ bearing: map.current.getBearing() + delta, duration: 300 });
  const pitchMap = (delta) => {
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
    <div className="relative w-full h-full bg-[#f8f9fa]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {/* View Toggle */}
      <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-3">
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

      {/* Camera Controls */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-1.5 shadow-2xl">
          <button onClick={() => pitchMap(15)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><ChevronUp size={20} /></button>
          <button onClick={() => rotateMap(-30)} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-colors"><RotateCcw size={20} /></button>
          <button onClick={() => map.current?.easeTo({bearing:0})} className="p-3 text-blue-400 hover:bg-white/10 rounded-2xl transition-colors">
            <Compass size={20} style={{ transform: `rotate(${-bearing}deg)` }} />
          </button>
          <button onClick={() => rotateMap(30)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"><RotateCw size={20} /></button>
          <button onClick={() => pitchMap(-15)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"><ChevronDown size={20} /></button>
        </div>
      </div>

      <style>{`
        .maplibregl-popup-content { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip { border-top-color: rgba(15, 23, 42, 0.9) !important; }
        .maplibregl-canvas-container.maplibregl-interactive { cursor: default; }
      `}</style>
    </div>
  );
};

export default MapLibreView;

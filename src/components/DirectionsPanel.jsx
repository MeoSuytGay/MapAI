import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ArrowLeftRight, X, Search, Loader2, ArrowLeft, MoreVertical, Flag, Car, Bike, Footprints } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DirectionsPanel = ({ onBack, onRouteSelected, initialOrigin = null, initialDestination = null, routeInfo = null }) => {
  const [originQuery, setOriginQuery] = useState(initialOrigin?.name || '');
  const [destQuery, setDestQuery] = useState(initialDestination?.name || '');
  
  const [origin, setOrigin] = useState(initialOrigin || null);
  const [destination, setDestination] = useState(initialDestination || null);

  // Sync state khi props thay đổi (quan trọng khi click từ bản đồ lúc panel đang mở)
  useEffect(() => {
    if (initialOrigin) {
      setOrigin(initialOrigin);
      setOriginQuery(initialOrigin.name);
    }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
      setDestQuery(initialDestination.name);
    }
  }, [initialDestination]);

  const [results, setResults] = useState({ type: null, items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null); // 'origin' or 'dest'
  const [travelMode, setTravelMode] = useState('driving'); // 'driving', 'bicycle', 'foot'

  const TRAVEL_MODES = [
    { id: 'driving', icon: <Car size={16} />, label: 'Ô tô' },
    { id: 'bicycle', icon: <Bike size={16} />, label: 'Xe đạp' },
    { id: 'foot', icon: <Footprints size={16} />, label: 'Đi bộ' },
  ];

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return { val: mins, unit: 'Phút' };
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return { val: `${hours}h${remainingMins > 0 ? remainingMins : ''}`, unit: '' };
  };

  const formatDistance = (meters) => {
    if (meters < 1000) return { val: Math.round(meters), unit: 'm' };
    return { val: (meters / 1000).toFixed(1), unit: 'km' };
  };

  const duration = routeInfo ? formatDuration(routeInfo.duration) : null;
  const distance = routeInfo ? formatDistance(routeInfo.distance) : null;

  const searchLocation = async (text, type) => {
    if (!text.trim() || text.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`
      );
      const data = await response.json();
      setResults({ type, items: data });
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === 'origin') searchLocation(originQuery, 'origin');
      else if (activeInput === 'dest') searchLocation(destQuery, 'dest');
    }, 500);
    return () => clearTimeout(timer);
  }, [originQuery, destQuery, activeInput]);

  const handleSelect = (item) => {
    const point = {
      name: item.display_name,
      lng: parseFloat(item.lon),
      lat: parseFloat(item.lat)
    };

    if (activeInput === 'origin') {
      setOrigin(point);
      setOriginQuery(item.display_name);
    } else {
      setDestination(point);
      setDestQuery(item.display_name);
    }
    
    setResults({ type: null, items: [] });
    setActiveInput(null);
  };

  useEffect(() => {
    if (origin && destination) {
      onRouteSelected(origin, destination, travelMode);
    }
  }, [origin, destination, travelMode]);

  const swapPoints = () => {
    const tempO = origin;
    const tempOQ = originQuery;
    setOrigin(destination);
    setOriginQuery(destQuery);
    setDestination(tempO);
    setDestQuery(tempOQ);
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="absolute top-24 left-6 w-[420px] bg-slate-950/90 backdrop-blur-3xl border border-white/10 z-[100] flex flex-col shadow-2xl rounded-3xl overflow-hidden max-h-[calc(100vh-120px)]"
    >
      {/* Header compact */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 hover:bg-white/10 rounded-full text-white/70 transition-all">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Chỉ đường</h2>
          </div>
          <div className="flex gap-1.5">
            {TRAVEL_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTravelMode(mode.id)}
                className={`p-2.5 rounded-xl transition-all ${
                  travelMode === mode.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-white/30 hover:bg-white/5 hover:text-white'
                }`}
              >
                {mode.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="absolute left-3.5 top-7 bottom-7 w-0.5 bg-white/10 rounded-full flex flex-col items-center justify-between py-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Điểm xuất phát..."
                value={originQuery}
                onFocus={() => setActiveInput('origin')}
                onChange={(e) => setOriginQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-[12px] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/20 font-bold"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors">
                 <MapPin size={14} />
              </div>
              {originQuery && (
                <button onClick={() => {setOriginQuery(''); setOrigin(null);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Điểm đến..."
                value={destQuery}
                onFocus={() => setActiveInput('dest')}
                onChange={(e) => setDestQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-[12px] text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-white/20 font-bold"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-rose-500 transition-colors">
                 <Flag size={14} />
              </div>
              {destQuery && (
                <button onClick={() => {setDestQuery(''); setDestination(null);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={swapPoints}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5"
          >
            <ArrowLeftRight size={18} className="rotate-90" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[120px]">
        <AnimatePresence mode="wait">
          {activeInput ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 flex flex-col gap-1.5"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-white/20">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-[10px] uppercase font-black tracking-widest">Đang tìm dữ liệu...</span>
                </div>
              ) : results.items.length > 0 ? (
                results.items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(item)}
                    className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-2xl text-left group transition-all border border-transparent hover:border-white/5"
                  >
                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${activeInput === 'origin' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      <MapPin size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.display_name}</p>
                      <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter mt-1 font-medium">
                        {item.type} • {item.address?.suburb || item.address?.city || 'Đà Nẵng'}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-16 text-center opacity-20 flex flex-col items-center gap-3">
                   <div className="w-12 h-12 rounded-full border border-dashed border-white flex items-center justify-center">
                     <Search size={24} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Nhập địa điểm để bắt đầu</p>
                </div>
              )}
            </motion.div>
          ) : origin && destination && routeInfo ? (
            <motion.div 
              key="route-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 flex flex-col gap-6"
            >
              <div className="p-5 bg-blue-500/10 rounded-[2rem] border border-blue-500/20">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black text-white">{duration.val}</span>
                  <span className="text-xs font-bold text-white/50 pb-1.5 uppercase tracking-widest">{duration.unit}</span>
                  <div className="mx-2 w-1.5 h-1.5 rounded-full bg-white/20 mb-2.5"></div>
                  <span className="text-3xl font-black text-white">{distance.val}</span>
                  <span className="text-xs font-bold text-white/50 pb-1.5 uppercase tracking-widest">{distance.unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-blue-500/20 rounded-lg">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Tuyến đường tốt nhất</span>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Fastest Route</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Bắt đầu ngay <Navigation size={14} />
                </button>
                <button className="p-4 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl transition-all border border-white/5">
                  <Flag size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center py-10 grayscale opacity-30">
                <Navigation className="text-white mb-4 animate-pulse" size={30} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Chọn điểm đi và đến</p>
             </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DirectionsPanel;

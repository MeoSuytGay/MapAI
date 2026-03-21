import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ArrowLeftRight, X, Search, Loader2, ArrowLeft, MoreVertical, Flag, Car, Bike, Footprints, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Power, Clock, CornerUpRight, CornerUpLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DirectionsPanel = ({ 
  onBack, 
  onRouteSelected, 
  onStartNavigation,
  onStopNavigation,
  onMoveCamera,
  isNavigating,
  initialOrigin = null, 
  initialDestination = null, 
  routeInfo = null 
}) => {
  const [originQuery, setOriginQuery] = useState(initialOrigin?.name || '');
  const [destQuery, setDestQuery] = useState(initialDestination?.name || '');
  const [origin, setOrigin] = useState(initialOrigin || null);
  const [destination, setDestination] = useState(initialDestination || null);
  const [results, setResults] = useState({ type: null, items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = routeInfo?.legs?.[0]?.steps || [];

  const TRAVEL_MODES = [
    { id: 'driving', icon: <Car size={18} />, label: 'Ô tô' },
    { id: 'bicycle', icon: <Bike size={18} />, label: 'Xe đạp' },
    { id: 'foot', icon: <Footprints size={18} />, label: 'Đi bộ' },
  ];

  const getStepIcon = (modifier) => {
    switch (modifier) {
      case 'right': return <CornerUpRight size={20} className="text-blue-400" />;
      case 'left': return <CornerUpLeft size={20} className="text-blue-400" />;
      case 'straight': return <ChevronUp size={20} className="text-emerald-400" />;
      default: return <Navigation size={20} className="text-blue-400" />;
    }
  };

  useEffect(() => {
    if (isNavigating && steps.length > 0) {
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => (prev + 1) % steps.length);
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [isNavigating, steps]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (initialOrigin) { setOrigin(initialOrigin); setOriginQuery(initialOrigin.name); }
  }, [initialOrigin]);

  useEffect(() => {
    if (initialDestination) { setDestination(initialDestination); setDestQuery(initialDestination.name); }
  }, [initialDestination]);

  useEffect(() => {
    if (origin && destination) onRouteSelected(origin, destination, travelMode);
  }, [origin, destination, travelMode]);

  const searchLocation = async (text, type) => {
    if (!text.trim() || text.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`);
      const data = await response.json();
      setResults({ type, items: data });
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeInput === 'origin') searchLocation(originQuery, 'origin');
      else if (activeInput === 'dest') searchLocation(destQuery, 'dest');
    }, 500);
    return () => clearTimeout(timer);
  }, [originQuery, destQuery, activeInput]);

  const formatDuration = (s) => {
    const m = Math.round(s / 60);
    return m < 60 ? { val: m, unit: 'Phút' } : { val: Math.floor(m/60), unit: 'Giờ', extra: m%60 };
  };

  const formatDistance = (m) => m < 1000 ? { val: Math.round(m), unit: 'm' } : { val: (m/1000).toFixed(1), unit: 'km' };

  const swapPoints = () => {
    const tempO = origin; const tempOQ = originQuery;
    setOrigin(destination); setOriginQuery(destQuery);
    setDestination(tempO); setDestQuery(tempOQ);
  };

  return (
    <>
      {/* Bảng chỉ đường CHÍNH (Chi tiết khi chưa đi, Giản đơn khi đang đi) */}
      <motion.div 
        animate={{ 
          width: isNavigating ? '300px' : '440px',
          height: isNavigating ? '90px' : 'auto',
          x: isNavigating ? 0 : 0
        }}
        className="absolute top-24 left-6 bg-slate-950/98 backdrop-blur-3xl border border-white/10 z-[100] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-hidden transition-all duration-500"
      >
        {!isNavigating ? (
          /* --- PHẦN CHI TIẾT ... --- */
          <div className="flex flex-col">
            <div className="p-7 border-b border-white/10 bg-gradient-to-br from-blue-500/10 via-transparent to-rose-500/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-all border border-white/5"><ArrowLeft size={20} /></button>
                  <h2 className="text-xs font-black uppercase tracking-[0.25em] text-white">Lập lộ trình</h2>
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                  {TRAVEL_MODES.map(m => (
                    <button key={m.id} onClick={() => setTravelMode(m.id)} className={`p-2.5 rounded-xl transition-all ${travelMode === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/30 hover:text-white'}`}>{m.icon}</button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center gap-5">
                {/* Đường kẻ minh họa điểm đi-đến */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-blue-500/20 to-rose-500 rounded-full flex flex-col items-center justify-between py-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <div className="relative group">
                    <input type="text" placeholder="Chọn điểm xuất phát..." value={originQuery} onFocus={() => setActiveInput('origin')} onChange={e => setOriginQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-white/20" />
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-500 transition-colors" size={16} />
                    {originQuery && <button onClick={() => {setOriginQuery(''); setOrigin(null);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><X size={14} /></button>}
                  </div>
                  <div className="relative group">
                    <input type="text" placeholder="Chọn điểm đến..." value={destQuery} onFocus={() => setActiveInput('dest')} onChange={e => setDestQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-[13px] text-white focus:outline-none focus:border-rose-500/50 transition-all font-bold placeholder:text-white/20" />
                    <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 group-focus-within:text-rose-500 transition-colors" size={16} />
                    {destQuery && <button onClick={() => {setDestQuery(''); setDestination(null);}} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><X size={14} /></button>}
                  </div>
                </div>

                <button onClick={swapPoints} className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5 shadow-inner"><ArrowLeftRight size={20} className="rotate-90" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-[100px] bg-slate-900/30">
              <AnimatePresence mode="wait">
                {activeInput ? (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 flex flex-col gap-2">
                    {isLoading ? (
                      <div className="py-10 flex flex-col items-center gap-3 text-white/20"><Loader2 className="animate-spin text-blue-500" size={24} /><span className="text-[10px] font-black uppercase tracking-widest">Đang tìm dữ liệu...</span></div>
                    ) : results.items.length > 0 ? (
                      results.items.map((item, idx) => (
                        <button key={idx} onClick={() => {
                          const p = { name: item.display_name, lng: parseFloat(item.lon), lat: parseFloat(item.lat) };
                          if (activeInput === 'origin') { setOrigin(p); setOriginQuery(item.display_name); } else { setDestination(p); setDestQuery(item.display_name); }
                          setResults({ type: null, items: [] }); setActiveInput(null);
                        }} className="w-full flex items-start gap-4 p-4 hover:bg-white/5 rounded-3xl text-left transition-all border border-transparent hover:border-white/5 group">
                          <div className={`mt-1 p-2 rounded-xl ${activeInput === 'origin' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}><MapPin size={16} /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold text-white group-hover:text-blue-400 transition-colors truncate">{item.display_name}</p>
                            <p className="text-[10px] text-white/30 truncate mt-1 uppercase font-medium">{item.type} • {item.address?.suburb || 'Đà Nẵng'}</p>
                          </div>
                        </button>
                      ))
                    ) : <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4"><Search size={32} /><p className="text-[11px] font-black uppercase tracking-[0.2em]">Nhập địa chỉ để bắt đầu</p></div>}
                  </motion.div>
                ) : origin && destination && routeInfo ? (
                  <motion.div key="route-info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-7 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -right-4 -top-4 p-6 opacity-10 group-hover:scale-110 transition-transform rotate-12"><Navigation size={100} /></div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Clock size={14} className="text-blue-400" />
                          </div>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Chi tiết hành trình</span>
                        </div>

                        <div className="flex items-end gap-2 mb-6">
                          <span className="text-5xl font-black text-white tracking-tighter">{formatDuration(routeInfo.duration).val}</span>
                          <span className="text-sm font-bold text-white/50 pb-2 uppercase tracking-widest">{formatDuration(routeInfo.duration).unit}</span>
                          {formatDuration(routeInfo.duration).extra > 0 && (
                            <><span className="text-3xl font-black text-white ml-2">{formatDuration(routeInfo.duration).extra}</span><span className="text-[10px] font-bold text-white/50 pb-1.5 uppercase">m</span></>
                          )}
                          <div className="mx-4 w-1 h-8 bg-white/10 rounded-full mb-2"></div>
                          <span className="text-3xl font-bold text-white/90">{formatDistance(routeInfo.distance).val}</span>
                          <span className="text-[10px] font-bold text-white/50 pb-1.5 uppercase tracking-widest">{formatDistance(routeInfo.distance).unit}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/30 uppercase mb-1">Dự kiến đến</p>
                            <p className="text-sm font-bold text-white">
                              {new Date(Date.now() + routeInfo.duration * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-white/30 uppercase mb-1">Thời tiết</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">28°C</span>
                              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Giao thông thông thoáng trên tuyến đường này</p>
                      </div>

                      <div className="flex justify-center mt-2">
                        <button 
                          onClick={onStartNavigation} 
                          className="px-10 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-[0_15px_30px_rgba(59,130,246,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 border border-blue-400/30 group"
                        >
                          Bắt đầu ngay 
                          <Navigation size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : <div className="h-40 flex flex-col items-center justify-center grayscale opacity-30"><Navigation className="text-white mb-4 animate-bounce" size={40} /><p className="text-[11px] font-black uppercase tracking-[0.4em]">Chọn điểm đến</p></div>}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* --- PHẦN GIẢN ĐƠN (Khi đang dẫn đường) --- */
          <div className="px-4 py-3 flex items-center gap-5 h-full bg-gradient-to-r from-blue-600/30 via-blue-600/5 to-transparent">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] shrink-0 scale-110">
              {currentStep ? getStepIcon(currentStep.maneuver.modifier) : <Navigation size={22} className="animate-pulse" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[15px] font-black text-white leading-tight mb-1 truncate tracking-tight">
                {currentStep ? currentStep.maneuver.instruction : destQuery}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.1em]">
                  {currentStep ? `${formatDistance(currentStep.distance).val} ${formatDistance(currentStep.distance).unit}` : 'Tiếp tục đi thẳng'}
                </span>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Hành trình tới {destQuery.split(',')[0]}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bộ điều khiển 4 hướng (Giữa dưới) */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 150, opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2"
          >
            <div className="flex flex-col items-center gap-2 p-2">
              {/* Nút Tiến */}
              <button 
                onMouseDown={() => onMoveCamera('forward')} 
                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/70 transition-all 
                           border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500
                           active:scale-90 shadow-xl"
              >
                <ChevronUp size={22} />
              </button>

              <div className="flex gap-4">
                {/* Nút Trái */}
                <button 
                  onMouseDown={() => onMoveCamera('left')} 
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/70 transition-all 
                             border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500
                             active:scale-90 shadow-xl"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Nút Lùi */}
                <button 
                  onMouseDown={() => onMoveCamera('backward')} 
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/70 transition-all 
                             border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500
                             active:scale-90 shadow-xl"
                >
                  <ChevronDown size={22} />
                </button>

                {/* Nút Phải */}
                <button 
                  onMouseDown={() => onMoveCamera('right')} 
                  className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/70 transition-all 
                             border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-500
                             active:scale-90 shadow-xl"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút Kết thúc chuyến đi (Góc trái dưới) */}
      <AnimatePresence>
        {isNavigating && (
          <motion.button
            initial={{ x: -150, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -150, opacity: 0 }}
            onClick={onStopNavigation}
            className="absolute bottom-10 left-10 z-[100] flex items-center gap-3 px-6 py-3.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-full shadow-lg font-black text-[9px] uppercase tracking-[0.15em] transition-all active:scale-95 border border-rose-400/20 group"
          >
            <div className="p-1.5 bg-white/10 rounded-lg group-hover:rotate-90 transition-transform"><Power size={14} /></div>
            Kết thúc
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default DirectionsPanel;

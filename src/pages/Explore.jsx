import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Utensils, 
  Coffee, 
  Compass, 
  TrendingUp, 
  Navigation2,
  Sparkles,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- MOCK DATA ĐÀ NẴNG ---
const MOCK_DATA = [
  { id: 1, name: "Cầu Rồng", type: "Du lịch", lat: 16.0611, lng: 108.2274, rating: 4.9, dist: "1.2km", tags: ["Biểu tượng", "Check-in"], img: "https://images.unsplash.com/photo-1559592442-7e18259f63cc?q=80&w=500&auto=format&fit=crop" },
  { id: 2, name: "Mì Quảng Bà Mua", type: "Ăn uống", lat: 16.0715, lng: 108.2201, rating: 4.7, dist: "0.8km", tags: ["Đặc sản", "Bình dân"], img: "https://images.unsplash.com/photo-1705307040375-74895788f4e2?q=80&w=500&auto=format&fit=crop" },
  { id: 3, name: "Bán đảo Sơn Trà", type: "Du lịch", lat: 16.1215, lng: 108.2774, rating: 4.8, dist: "5.5km", tags: ["Thiên nhiên", "View đẹp"], img: "https://images.unsplash.com/photo-1590432805541-69239869689f?q=80&w=500&auto=format&fit=crop" },
  { id: 4, name: "Wonderlust Cafe", type: "Cafe", lat: 16.0689, lng: 108.2215, rating: 4.6, dist: "1.5km", tags: ["Sống ảo", "Yên tĩnh"], img: "https://images.unsplash.com/photo-1501339817308-44b29ad55bb2?q=80&w=500&auto=format&fit=crop" },
  { id: 5, name: "Bãi biển Mỹ Khê", type: "Du lịch", lat: 16.0654, lng: 108.2474, rating: 4.9, dist: "2.1km", tags: ["Trending", "Biển"], img: "https://images.unsplash.com/photo-1582234032483-34e857413693?q=80&w=500&auto=format&fit=crop" },
  { id: 6, name: "Hải sản Năm Đảnh", type: "Ăn uống", lat: 16.0912, lng: 108.2512, rating: 4.5, dist: "3.2km", tags: ["Hải sản", "Giá rẻ"], img: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=500&auto=format&fit=crop" },
  { id: 7, name: "The Cups Coffee", type: "Cafe", lat: 16.0754, lng: 108.2234, rating: 4.4, dist: "0.5km", tags: ["Làm việc", "View phố"], img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=500&auto=format&fit=crop" },
  { id: 8, name: "Chùa Linh Ứng", type: "Du lịch", lat: 16.1001, lng: 108.2778, rating: 4.9, dist: "6.0km", tags: ["Tâm linh", "Vĩ đại"], img: "https://images.unsplash.com/photo-1590432805629-165b4c489b4b?q=80&w=500&auto=format&fit=crop" },
];

const FILTER_TABS = [
  { id: 'All', label: 'Tất cả', icon: Compass },
  { id: 'Ăn uống', label: 'Ăn uống', icon: Utensils },
  { id: 'Cafe', label: 'Cafe', icon: Coffee },
  { id: 'Du lịch', label: 'Du lịch', icon: Compass },
  { id: 'Trending', label: 'Trending', icon: TrendingUp },
];

const Explore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsAiSearching(true);
      const timer = setTimeout(() => {
        const filtered = MOCK_DATA.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 4);
        setSuggestions(filtered);
        setIsAiSearching(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsAiSearching(false);
    }
  }, [searchQuery]);

  const goToMap = (lat, lng) => {
    navigate(`/map?lat=${lat}&lng=${lng}`);
  };

  const filteredItems = activeTab === 'All' 
    ? MOCK_DATA 
    : activeTab === 'Trending' 
      ? MOCK_DATA.filter(i => i.tags.includes('Trending'))
      : MOCK_DATA.filter(i => i.type === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      <Header />

      {/* Hero Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20 relative z-10">
        
        {/* --- 1. SEARCH BAR --- */}
        <section className="flex flex-col items-center mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl relative"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn muốn đi đâu ở Đà Nẵng?"
                className="w-full bg-slate-900/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all text-[13px] font-bold shadow-2xl backdrop-blur-xl placeholder:text-slate-600"
              />
              {isAiSearching && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <Sparkles size={12} className="text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">AI Suggested</span>
                  </div>
                  <div className="space-y-1">
                    {suggestions.map(item => (
                      <button 
                        key={item.id}
                        onClick={() => goToMap(item.lat, item.lng)}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin size={14} className="text-blue-500" />
                          <div>
                            <p className="text-[12px] font-black text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-500">{item.type} • {item.dist}</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Chips */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-6">
              {["Ăn gì", "Cafe đẹp", "Check-in", "Gần tôi"].map(chip => (
                <button 
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-slate-400 hover:text-white hover:bg-blue-600/20 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* --- 2. FILTER TABS --- */}
        <section className="mb-14 flex justify-center overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-3">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* --- 3. SECTIONS --- */}
        
        {/* A. ĐỊA ĐIỂM NỔI BẬT (Carousel) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Địa điểm nổi bật</h2>
            </div>
            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 group">
              Xem tất cả <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x">
            {MOCK_DATA.filter(i => i.rating >= 4.8).map(item => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -5 }}
                onClick={() => goToMap(item.lat, item.lng)}
                className="min-w-[260px] md:min-w-[300px] bg-slate-900/40 border border-white/5 rounded-[2rem] overflow-hidden snap-start cursor-pointer shadow-xl group"
              >
                <div className="h-40 relative">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-slate-950/60 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/10">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black text-white">{item.rating}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-black text-white mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation2 size={10} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.dist} • {item.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* B. GRID SECTIONS */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-8 px-1">
            <Utensils size={16} className="text-indigo-500" />
            <h2 className="text-lg font-black text-white tracking-tight uppercase">Ẩm thực & Cafe</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_DATA.filter(i => i.type === 'Ăn uống' || i.type === 'Cafe').map(item => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -4 }}
                onClick={() => goToMap(item.lat, item.lng)}
                className="bg-slate-900/40 border border-white/5 rounded-[1.5rem] overflow-hidden cursor-pointer group shadow-lg"
              >
                <div className="h-28 relative overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-white">
                    {item.type}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-[12px] font-black text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-500 italic">{item.dist}</span>
                    <div className="flex items-center gap-1">
                      <Star size={9} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-black text-white">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      <Footer />

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default Explore;

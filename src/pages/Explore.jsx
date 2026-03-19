import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Coffee, Utensils, Camera, TrendingUp, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ... (locations and categories definitions remain the same)
const locations = [
  { id: 1, name: "Cầu Rồng", type: "Du lịch", lat: 16.0611, lng: 108.2274, rating: 4.8, image: "https://images.unsplash.com/photo-1559592442-992ca3993433?q=80&w=1000&auto=format&fit=crop", tags: ["Check-in", "Biểu tượng"], distance: "1.2km", isFeatured: true },
  { id: 2, name: "Bà Nà Hills", type: "Du lịch", lat: 15.9989, lng: 107.9961, rating: 4.9, image: "https://images.unsplash.com/photo-1582234032482-62323e0ecf79?q=80&w=1000&auto=format&fit=crop", tags: ["Sống ảo", "Vui chơi"], distance: "25km", isFeatured: true },
  { id: 3, name: "Bánh Xèo Bà Dưỡng", type: "Ăn uống", lat: 16.0520, lng: 108.2163, rating: 4.6, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1000&auto=format&fit=crop", tags: ["Đặc sản", "Hải sản"], distance: "2.5km", isFeatured: false },
  { id: 4, name: "The Cup Coffee", type: "Cafe", lat: 16.0680, lng: 108.2230, rating: 4.5, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop", tags: ["Yên tĩnh", "View đẹp"], distance: "0.8km", isFeatured: false },
  { id: 5, name: "Bãi biển Mỹ Khê", type: "Du lịch", lat: 16.0601, lng: 108.2464, rating: 4.7, image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000&auto=format&fit=crop", tags: ["Biển", "Gần tôi"], distance: "3.1km", isFeatured: true },
  { id: 6, name: "Wonderlust Cafe", type: "Cafe", lat: 16.0652, lng: 108.2205, rating: 4.7, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop", tags: ["Sống ảo", "Thiết kế"], distance: "1.5km", isFeatured: false },
  { id: 7, name: "Hải sản Năm Đảnh", type: "Ăn uống", lat: 16.0963, lng: 108.2562, rating: 4.4, image: "https://images.unsplash.com/photo-1551489186-cf8726f514f8?q=80&w=1000&auto=format&fit=crop", tags: ["Hải sản", "Giá rẻ"], distance: "4.2km", isFeatured: false },
  { id: 8, name: "Sơn Trà Marina", type: "Cafe", lat: 16.1215, lng: 108.2750, rating: 4.8, image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=1000&auto=format&fit=crop", tags: ["View đẹp", "Địa Trung Hải"], distance: "7.5km", isFeatured: false },
];

const categories = [
  { id: 'all', name: 'Tất cả', icon: <Filter size={18} /> },
  { id: 'eat', name: 'Ăn uống', icon: <Utensils size={18} />, type: 'Ăn uống' },
  { id: 'cafe', name: 'Cafe', icon: <Coffee size={18} />, type: 'Cafe' },
  { id: 'travel', name: 'Du lịch', icon: <Camera size={18} />, type: 'Du lịch' },
  { id: 'trending', name: 'Trending', icon: <TrendingUp size={18} />, isTrending: true },
];

const Explore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // Xử lý filter
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const category = categories.find(c => c.id === activeTab);
      
      let matchesTab = true;
      if (activeTab !== 'all') {
        if (category?.isTrending) matchesTab = loc.rating >= 4.7;
        else matchesTab = loc.type === category?.type;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab]);

  const handleLocationClick = (loc) => {
    navigate(`/map?lat=${loc.lat}&lng=${loc.lng}`);
  };

  const quickSuggestions = ["Ăn gì", "Cafe đẹp", "Check-in", "Gần tôi"];

  return (
    <div className="bg-slate-950 text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-12 md:pt-16 md:pb-20 flex-grow w-full">
        {/* Search Header Section */}
        <section className="flex flex-col items-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-center"
          >
            Khám phá Đà Nẵng
          </motion.h1>

          <div className="w-full max-w-2xl relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
              </div>
              <input 
                type="text"
                placeholder="Bạn muốn đi đâu ở Đà Nẵng?"
                className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-lg"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(e.target.value.length > 0);
                }}
              />
              {isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-50">
                  <div className="p-2">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Gợi ý cho bạn</div>
                    {filteredLocations.slice(0, 4).map(loc => (
                      <button 
                        key={loc.id}
                        onClick={() => handleLocationClick(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <MapPin size={16} className="text-indigo-400" />
                        <div>
                          <div className="text-sm font-medium">{loc.name}</div>
                          <div className="text-xs text-slate-500">{loc.type} • {loc.distance}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickSuggestions.map(tag => (
                <button 
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-sm text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Tabs */}
        <section className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 min-w-max pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all ${
                  activeTab === cat.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {cat.icon}
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Section (Carousel) */}
        {activeTab === 'all' && !searchTerm && (
          <section className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={24} />
                Địa điểm nổi bật
              </h2>
              <button className="text-indigo-400 text-sm font-medium flex items-center gap-1 hover:text-indigo-300 transition-colors">
                Xem tất cả <ArrowRight size={14} />
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
              {locations.filter(l => l.isFeatured).map(loc => (
                <motion.div
                  key={loc.id}
                  whileHover={{ y: -5 }}
                  onClick={() => handleLocationClick(loc)}
                  className="flex-shrink-0 w-[300px] md:w-[380px] snap-start cursor-pointer group"
                >
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-4">
                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{loc.rating}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-xs font-semibold text-indigo-300 uppercase mb-1 tracking-wider">{loc.type}</div>
                      <h3 className="text-xl font-bold">{loc.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Results Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {activeTab === 'all' ? 'Tất cả địa điểm' : categories.find(c => c.id === activeTab)?.name}
            </h2>
            <span className="text-slate-500 text-sm font-medium">{filteredLocations.length} địa điểm được tìm thấy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredLocations.map((loc) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={loc.id}
                  onClick={() => handleLocationClick(loc)}
                  className="group bg-slate-900/40 border border-slate-800/50 rounded-[2rem] overflow-hidden hover:bg-slate-900/60 hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={loc.image} alt={loc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold border border-white/10">
                      {loc.distance}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{loc.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {loc.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-500">{loc.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {loc.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-slate-800/50 rounded-lg text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border border-slate-800 mb-4">
                <Search size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500">Thử tìm kiếm với từ khóa khác nhé!</p>
            </div>
          )}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default Explore;

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Compass, 
  Send, 
  MapPin, 
  Cpu, 
  Navigation2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function Home() {
  const navigate = useNavigate()

  return (
    <div className="bg-slate-950 text-slate-200 overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <main className="relative pt-16 pb-20 px-6 md:px-12 flex flex-col items-center">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-full bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px]"
          />
          <motion.div 
            animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ x: [20, -20, 20], y: [20, -20, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]"
          />
        </div>

        {/* Hero Content */}
        <motion.div 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <motion.div 
            variants={fadeIn}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Next Gen AI Mapping</span>
          </motion.div>

          <motion.h1 
            variants={fadeIn}
            className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter text-white drop-shadow-2xl"
          >
            Đà Nẵng <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-600 bg-clip-text text-transparent italic">
              Thông minh
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            Cuộc cách mạng bản đồ số. Trò chuyện trực tiếp với AI để điều khiển bản đồ, tìm kiếm địa điểm và lên kế hoạch hành trình hoàn hảo.
          </motion.p>

          <motion.div 
            variants={fadeIn}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-28"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              <span className="relative z-10">Bắt đầu trò chuyện</span>
              <MessageSquare className="relative z-10 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/explore")}
              className="w-full sm:w-auto px-12 py-5 bg-white/5 text-white font-black rounded-2xl border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-3 group"
            >
              <span>Khám phá ngay</span>
              <Compass className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            </motion.button>
          </motion.div>

          {/* Interactive Chat/Map Preview */}
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="relative max-w-6xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              {/* Header Preview */}
              <div className="px-10 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-500/30 border border-rose-500/50"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30 border border-amber-500/50"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-500/50"></div>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-950/50 border border-white/10 shadow-inner">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">MapAI Neural Engine Active</span>
                </div>
                <div className="w-12"></div>
              </div>
              
              <div className="grid lg:grid-cols-3 h-[600px]">
                {/* Chat Column */}
                <div className="col-span-1 border-r border-white/5 p-8 flex flex-col gap-8 text-left bg-slate-950/20">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-3xl rounded-tl-none shadow-lg shadow-blue-500/5"
                  >
                    <p className="text-sm text-blue-100 leading-relaxed font-bold">Chào mừng bạn! Tôi đã sẵn sàng hỗ trợ bạn khám phá Đà Nẵng. Bạn muốn đi đâu?</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="bg-white/5 p-5 rounded-3xl rounded-tr-none self-end border border-white/10 shadow-lg"
                  >
                    <p className="text-sm text-slate-200 font-bold italic flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" /> Tìm các điểm check-in hoàng hôn đẹp nhất.
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl rounded-tl-none shadow-lg shadow-indigo-500/5"
                  >
                    <p className="text-sm text-indigo-100 leading-relaxed font-bold flex items-center gap-2">
                      <Layers size={14} /> Đang quét dữ liệu thời gian thực... Đã tìm thấy 3 vị trí tuyệt vời cho bạn.
                    </p>
                  </motion.div>

                  <div className="mt-auto relative group/input">
                    <input 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-600 text-white font-medium" 
                      placeholder="Nhập yêu cầu của bạn..." 
                      readOnly 
                    />
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                      <Send size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Map Column */}
                <div className="col-span-2 relative bg-slate-800/30 overflow-hidden">
                   <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/108.23,16.06,12.5/1200x800?access_token=pk.eyJ1IjoiZ2VtaW5pLWNsaSIsImEiOiJjbHRyeHBwYmcwMTFqMmtvNHZqOXp2OWV3In0.fake')] bg-cover bg-center"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 opacity-80"></div>
                   
                   {/* Pulsing Markers */}
                   <div className="absolute top-[30%] left-[40%]">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
                        <div className="absolute w-8 h-8 bg-blue-500/50 rounded-full animate-pulse"></div>
                        <MapPin className="relative text-blue-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
                      </div>
                   </div>
                   
                   <div className="absolute bottom-[40%] right-[30%]">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-10 h-10 bg-indigo-500/30 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                        <MapPin className="relative text-indigo-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(99,102,241,1)]" />
                      </div>
                   </div>

                   {/* Floating Dashboard Overlay */}
                   <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-8 left-8 right-8 p-6 bg-slate-950/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-wrap gap-8 items-center"
                   >
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl"><Navigation2 size={20} className="text-blue-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Khoảng cách</p>
                          <p className="text-sm font-black text-white">4.2 km</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/20 rounded-xl"><ShieldCheck size={20} className="text-emerald-400" /></div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Độ chính xác</p>
                          <p className="text-sm font-black text-white">99.9%</p>
                        </div>
                     </div>
                   </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
          >
            Sức mạnh của Trí Tuệ Bản Đồ
          </motion.h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { 
              icon: <Cpu className="text-blue-500 w-10 h-10" />, 
              title: "Neural Search", 
              desc: "Tìm kiếm bằng ngôn ngữ tự nhiên. AI hiểu ý định của bạn, không chỉ là từ khóa.",
              color: "blue"
            },
            { 
              icon: <Navigation2 className="text-indigo-500 w-10 h-10" />, 
              title: "Real-time Magic", 
              desc: "Dữ liệu giao thông, thời tiết và sự kiện được cập nhật tức thì trên giao diện 3D.",
              color: "indigo"
            },
            { 
              icon: <ShieldCheck className="text-purple-500 w-10 h-10" />, 
              title: "Smart Security", 
              desc: "Bảo mật tuyệt đối thông tin vị trí và lịch sử tìm kiếm cá nhân của bạn.",
              color: "purple"
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-12 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className={`w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 font-bold leading-relaxed opacity-80">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto rounded-[4rem] bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-16 md:p-32 text-center relative shadow-[0_50px_100px_rgba(59,130,246,0.2)]"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]"></div>
          
          <h2 className="text-5xl md:text-8xl font-black text-white mb-10 relative z-10 tracking-tighter leading-none">
            Bắt đầu tương lai <br /> của bản đồ
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-16 max-w-3xl mx-auto font-bold opacity-90 relative z-10 leading-relaxed">
            Tham gia cùng hơn 100,000 người dùng đang khám phá thế giới qua lăng kính trí tuệ nhân tạo.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-16 py-6 bg-white text-blue-900 font-black rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 text-lg"
            >
              Đăng ký ngay <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  )
}

export default Home

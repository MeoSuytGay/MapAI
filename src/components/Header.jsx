import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Map, 
  Menu, 
  LogIn, 
  Search, 
  Bell, 
  Compass, 
  Zap, 
  MapIcon, 
  ChevronDown 
} from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5 px-4 md:px-10 h-16 flex justify-between items-center transition-all duration-300"
    >
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-8">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group/logo" 
          onClick={() => navigate("/")}
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"
          >
            <Map className="text-white w-5 h-5" />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tighter text-white group-hover/logo:text-blue-400 transition-colors">
                MapAI
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-widest">Beta</span>
            </div>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] -mt-0.5">Neural Navigation</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {[
            { name: 'Khám phá', icon: Compass, path: '/explore' },
            { name: 'Tính năng', icon: Zap, path: '#' },
            { name: 'Bản đồ', icon: MapIcon, path: '/map' },
          ].map((item) => (
            <button 
              key={item.name}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-white transition-all group cursor-pointer bg-transparent border-none outline-none"
            >
              <item.icon size={14} className="group-hover:text-blue-500 transition-colors" />
              {item.name}
              <ChevronDown size={10} className="opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="hidden md:flex items-center gap-2 border-r border-white/5 pr-5">
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <Search size={16} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full border border-slate-950"></span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/login")}
            className="hidden sm:flex items-center gap-2 text-[12px] font-bold text-slate-300 hover:text-blue-400 transition-colors"
          >
            <LogIn size={15} /> Đăng nhập
          </button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-white text-slate-950 text-[12px] font-black rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
          >
            Bắt đầu
          </motion.button>
          <button className="lg:hidden text-white p-1.5 bg-white/5 rounded-lg border border-white/10">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header

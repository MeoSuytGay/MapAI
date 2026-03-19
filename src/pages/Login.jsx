import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  Check
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (email === "admin" && password === "admin") {
        setIsLoading(false);
        navigate("/");
      } else {
        setIsLoading(false);
        setError("Thông tin xác thực không chính xác.");
      }
    }, 1000);
  };

  return (
    <div className="font-body bg-slate-950 text-slate-200 min-h-full flex flex-col selection:bg-blue-500/30 overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="flex-grow flex items-center justify-center pt-12 pb-12 px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[430px]"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white mb-1.5 tracking-tight">Xác thực quyền truy cập</h1>
            <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.1em]">Hệ thống bản đồ Neural Mapping v2.0</p>
          </div>

          <motion.div 
            animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
            className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-7 md:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Top Detail Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01, backgroundColor: "#f8fafc" }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 bg-white text-slate-950 font-black rounded-xl flex items-center justify-center gap-2.5 transition-all text-[12px] shadow-lg shadow-white/5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sử dụng Google Auth</span>
              </motion.button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="mx-4 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em]">MapAI Credential</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2 text-rose-400 text-[10px] font-bold"
                  >
                    <AlertCircle size={12} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3.5">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tên đăng nhập (admin)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-800 text-white font-bold text-[13px]"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu (admin)"
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/50 border border-white/5 rounded-xl focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-800 text-white font-bold text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border border-white/10 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white/5 group-hover:bg-white/10'}`}
                  >
                    {rememberMe && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 select-none">Duy trì đăng nhập</span>
                </label>
                <button 
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[10px] font-black text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  <ShieldCheck size={10} /> Quên mật khẩu?
                </button>
              </div>

              <motion.button
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 text-[13px]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Truy cập Neural Map</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-7 text-center pt-5 border-t border-white/5">
              <p className="text-slate-500 font-bold text-[11px]">
                Chưa có tài khoản hệ thống?
                <button 
                  onClick={() => navigate("/register")} 
                  className="text-white ml-2 hover:text-blue-500 font-black transition-colors"
                >
                  Yêu cầu cấp quyền
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

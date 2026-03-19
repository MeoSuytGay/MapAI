import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log("Register submitted:", { name, email, password });
      setIsLoading(false);
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="font-body bg-slate-950 text-slate-200 min-h-screen flex flex-col">
      {/* Header (Minimal) */}
      <header className="px-6 py-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm font-bold">map</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MapAI</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white mb-2">Tạo tài khoản mới</h1>
            <p className="text-slate-400">Bắt đầu hành trình khám phá Đà Nẵng cùng AI</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@vidu.vn"
                  className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
                />
              </div>

              <button
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? "Đang xử lý..." : "Đăng ký ngay"}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-400 text-sm">
              Đã có tài khoản?
              <button onClick={() => navigate("/login")} className="text-white font-bold ml-1 hover:underline">Đăng nhập</button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

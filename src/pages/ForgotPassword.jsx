import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      console.log("Password reset request for:", email);
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="font-body bg-slate-950 text-slate-200 min-h-screen flex flex-col">
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
            <h1 className="text-3xl font-extrabold text-white mb-2">Quên mật khẩu?</h1>
            <p className="text-slate-400">Nhập email của bạn để nhận liên kết khôi phục</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email khôi phục</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@vidu.vn"
                    className="w-full px-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
                  />
                </div>

                <button
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? "Đang gửi..." : "Gửi liên kết"}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Đã gửi yêu cầu!</h2>
                <p className="text-slate-400 text-sm mb-8">
                  Vui lòng kiểm tra hộp thư đến của <b>{email}</b> để tiếp tục.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            )}

            {!isSent && (
              <button 
                onClick={() => navigate("/login")} 
                className="w-full mt-6 text-slate-500 hover:text-white text-sm font-semibold transition-colors"
              >
                Quay lại đăng nhập
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

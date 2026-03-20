import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  forgotPassword: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Giả lập kiểm tra token từ LocalStorage khi khởi động
    const storedUser = localStorage.getItem("mapai_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("mapai_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrUsername, password) => {
    // Giả lập gọi API đăng nhập
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          (emailOrUsername === "admin" && password === "admin") ||
          (emailOrUsername === "test@example.com" && password === "password123")
        ) {
          const userData = {
            id: "1",
            name: emailOrUsername === "admin" ? "Hệ thống Quản trị" : "Người dùng Thử nghiệm",
            email: emailOrUsername === "admin" ? "admin@mapai.vn" : "test@example.com",
            avatar: null,
            role: emailOrUsername === "admin" ? "admin" : "user",
          };
          setUser(userData);
          localStorage.setItem("mapai_user", JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error("Thông tin xác thực không chính xác."));
        }
      }, 1000);
    });
  };

  const register = async (name, email, password) => {
    // Giả lập gọi API đăng ký
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          avatar: null,
          role: "user",
        };
        // Tự động đăng nhập sau khi đăng ký thành công
        setUser(userData);
        localStorage.setItem("mapai_user", JSON.stringify(userData));
        resolve(userData);
      }, 1500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mapai_user");
  };

  const forgotPassword = async (email) => {
    // Giả lập gọi API quên mật khẩu
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Reset password link sent to: ${email}`);
        resolve();
      }, 1500);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

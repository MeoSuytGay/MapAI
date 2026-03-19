# MapAI - React Project Structure

Dự án này được xây dựng trên nền tảng **React (Vite)** tích hợp **Tailwind CSS v4** và **React Router**. Cấu trúc thư mục được thiết kế theo tiêu chuẩn công nghiệp giúp dễ dàng bảo trì và mở rộng.

---

## 🛠 Cấu trúc thư mục dự án

Dưới đây là mô tả chi tiết về các thư mục trong `src/`:

- **`src/assets/`**: Chứa các tệp tĩnh như hình ảnh (PNG, JPG, SVG), icons, và các tệp tài nguyên khác dùng trong ứng dụng.
- **`src/components/`**: Chứa các Component UI dùng chung cho toàn bộ dự án (ví dụ: Button, Input, Modal, Navbar, Footer). Các component ở đây nên mang tính tái sử dụng cao.
- **`src/pages/`**: Mỗi tệp trong thư mục này đại diện cho một trang (Route) của ứng dụng. Ví dụ: `Home.jsx`, `About.jsx`, `Dashboard.jsx`.
- **`src/hooks/`**: Chứa các Custom Hooks của React để tách biệt logic xử lý khỏi giao diện (ví dụ: `useAuth.js`, `useFetch.js`).
- **`src/context/`**: Quản lý trạng thái toàn cục (Global State) bằng React Context API (ví dụ: `AuthContext.js`, `ThemeContext.js`).
- **`src/services/`**: Nơi thực hiện các cuộc gọi API (axios/fetch) và xử lý logic kết nối với Back-end hoặc các dịch vụ bên ngoài.
- **`src/utils/`**: Chứa các hàm hỗ trợ (helper functions), hằng số (constants), và các định dạng dữ liệu dùng chung (ví dụ: `formatDate.js`, `validators.js`).
- **`src/App.jsx`**: Component gốc, nơi cấu hình Routing chính cho ứng dụng.
- **`src/main.jsx`**: Điểm khởi đầu của ứng dụng, nơi render React vào DOM và cấu hình các Provider bao quanh (BrowserRouter, Providers).

---

## 🚀 Công nghệ sử dụng

- **React 19**: Thư viện UI hiện đại.
- **Vite 8**: Công cụ xây dựng (build tool) siêu nhanh cho phát triển front-end.
- **Tailwind CSS v4**: Framework CSS utility-first mới nhất, tối ưu hiệu suất qua Vite plugin.
- **React Router 7**: Quản lý điều hướng và định tuyến trong ứng dụng.

---

## 💻 Cách chạy dự án

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

2. **Chạy dự án ở chế độ Development**:
   ```bash
   npm run dev
   ```

3. **Xây dựng bản Production**:
   ```bash
   npm run build
   ```

4. **Kiểm tra lỗi Lint**:
   ```bash
   npm run lint
   ```

---

Dự án đã được cấu hình sẵn để bạn có thể bắt đầu code ngay lập tức bằng Tailwind CSS và React Router.

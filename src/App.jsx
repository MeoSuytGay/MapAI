import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Explore from './pages/Explore'
import MapPage from './pages/MapPage'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Các trang có Header và Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Các trang KHÔNG có Header và Footer (ví dụ Bản đồ) */}
      <Route path="/map" element={<MapPage />} />
    </Routes>
  )
}

export default App

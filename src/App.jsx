import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Explore from './pages/Explore'
import MapPage from './pages/MapPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Các trang có Header và Footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        
        {/* Auth routes - redirect to home if already logged in */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />

        {/* Protected routes within MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/explore" element={<Explore />} />
        </Route>
      </Route>

      {/* Protected routes OUTSIDE MainLayout (e.g. Map) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/map" element={<MapPage />} />
      </Route>
      
      {/* Catch all - 404 or redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

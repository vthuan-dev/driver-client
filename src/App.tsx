import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import MyBookingsPage from './pages/MyBookingsPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
            </Routes>
            <BottomNav />
            <AuthModal />
          </div>
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

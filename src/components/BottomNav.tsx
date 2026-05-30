import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, ClipboardList, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const TABS = [
  { path: '/',            label: 'Trang chủ', Icon: Home },
  { path: '/search',      label: 'Tìm xe',    Icon: Search },
  { path: '/my-bookings', label: 'Lịch sử',   Icon: ClipboardList },
];

const BottomNav = () => {
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleAccount = () => {
    if (user) navigate('/my-bookings');
    else openAuth('login');
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  const accountActive = pathname === '/login' || pathname === '/register'
    || (user && pathname === '/my-bookings');

  return (
    <nav className="bottom-nav">
      {TABS.map(({ path, label, Icon }) => {
        const active = isActive(path);
        return (
          <button
            key={path}
            className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
            onClick={() => {
              if (path === '/my-bookings' && !user) openAuth('login');
              else navigate(path);
            }}
          >
            <div className="bottom-nav__icon-wrap">
              {active && (
                <motion.div
                  className="bottom-nav__pill"
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            </div>
            <span className="bottom-nav__label">{label}</span>
          </button>
        );
      })}

      {/* Account tab */}
      <button
        className={`bottom-nav__item${accountActive ? ' bottom-nav__item--active' : ''}`}
        onClick={handleAccount}
      >
        <div className="bottom-nav__icon-wrap">
          {accountActive && (
            <motion.div
              className="bottom-nav__pill"
              layoutId="nav-pill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          {user ? (
            <div className="bottom-nav__avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <UserCircle size={22} strokeWidth={1.8} />
          )}
        </div>
        <span className="bottom-nav__label">
          {user ? user.name.split(' ').pop() : 'Đăng nhập'}
        </span>
      </button>

      {/* Logout pill — only when logged in */}
      <AnimatePresence>
        {user && (
          <motion.button
            className="bottom-nav__logout"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut size={14} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default BottomNav;

import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="topbar">
      <span className="topbar__logo">BOOK RIDE <span>VN</span></span>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="topbar__user" onClick={() => navigate('/my-bookings')}>
            <div className="topbar__user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="topbar__user-info">
              <span className="topbar__user-name">{user.name.split(' ').slice(-2).join(' ')}</span>
              <span className="topbar__user-phone">{user.phone}</span>
            </div>
          </button>
          <button onClick={handleLogout} title="Đăng xuất" style={{
            width: 34, height: 34, borderRadius: 999, border: '1.5px solid #fee2e2',
            background: '#fff', display: 'grid', placeItems: 'center',
            cursor: 'pointer', color: '#ef4444', flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <button className="topbar__login-btn" onClick={() => openAuth('login')}>
          Đăng nhập
        </button>
      )}
    </header>
  );
};

export default Navbar;

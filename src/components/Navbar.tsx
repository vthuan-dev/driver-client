import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="topbar">
      <button className="topbar__icon-btn" aria-label="Menu">
        <Menu size={20} />
      </button>

      <span className="topbar__logo">RIDE <span>APP</span></span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {user ? (
          <>
            <button
              className="topbar__user-chip"
              onClick={() => navigate('/my-bookings')}
              aria-label="My bookings"
            >
              <div className="topbar__user-chip__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span>{user.name.split(' ').pop()}</span>
            </button>
            <button
              onClick={handleLogout}
              title="Log out"
              style={{
                width: 34, height: 34, borderRadius: 999, border: '1.5px solid #fee2e2',
                background: '#fff', display: 'grid', placeItems: 'center',
                cursor: 'pointer', color: '#ef4444', flexShrink: 0,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}
            >
              <LogOut size={15} strokeWidth={2} />
            </button>
          </>
        ) : (
          <>
            <button className="topbar__login-btn" onClick={() => openAuth('login')}>
              Log In
            </button>
            <button className="topbar__icon-btn" aria-label="Notifications">
              <Bell size={20} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;

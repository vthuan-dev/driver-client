import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const Navbar = () => {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <span className="topbar__logo">BOOK RIDE <span>VN</span></span>

      {user ? (
        <button className="topbar__user" onClick={() => navigate('/my-bookings')}>
          <div className="topbar__user-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">{user.name.split(' ').slice(-2).join(' ')}</span>
            <span className="topbar__user-phone">{user.phone}</span>
          </div>
        </button>
      ) : (
        <button className="topbar__login-btn" onClick={() => openAuth('login')}>
          Đăng nhập
        </button>
      )}
    </header>
  );
};

export default Navbar;

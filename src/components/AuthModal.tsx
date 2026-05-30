import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, User, LogIn, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const AuthModal = () => {
  const { login, register } = useAuth();
  const { isOpen, tab, closeAuth, switchTab } = useAuthModal();

  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'checking' | 'taken' | 'free'>('idle');
  const phoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const phone = regForm.phone.trim();
    if (phone.length < 9) { setPhoneStatus('idle'); return; }
    setPhoneStatus('checking');
    if (phoneTimer.current) clearTimeout(phoneTimer.current);
    phoneTimer.current = setTimeout(async () => {
      try {
        await api.get(`/auth/status/${phone}`);
        setPhoneStatus('taken');
      } catch {
        setPhoneStatus('free');
      }
    }, 500);
    return () => { if (phoneTimer.current) clearTimeout(phoneTimer.current); };
  }, [regForm.phone]);

  const resetErrors = () => setError('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.phone || !loginForm.password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setLoading(true); resetErrors();
    try {
      await login(loginForm.phone, loginForm.password);
      closeAuth();
      setLoginForm({ phone: '', password: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message || 'Đăng nhập thất bại';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.phone || !regForm.password) { setError('Vui lòng điền đầy đủ thông tin'); return; }
    if (phoneStatus === 'taken') { setError('Số điện thoại này đã được đăng ký'); return; }
    if (regForm.password.length < 4) { setError('Mật khẩu phải có ít nhất 4 ký tự'); return; }
    if (regForm.password !== regForm.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true); resetErrors();
    try {
      await register(regForm.name, regForm.phone, regForm.password);
      closeAuth();
      setRegForm({ name: '', phone: '', password: '', confirm: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message || 'Đăng ký thất bại';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleTabSwitch = (t: 'login' | 'register') => {
    switchTab(t);
    resetErrors();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && closeAuth()}
        >
          <motion.div
            className="auth-modal-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="sheet-handle"><div className="sheet-handle__bar" /></div>

            {/* Logo row */}
            <div className="auth-modal-logo">
              <span className="auth-modal-logo__icon">🚗</span>
              <span className="auth-modal-logo__brand">BOOK RIDE <span>VN</span></span>
              <button className="auth-modal-close" onClick={closeAuth}><X size={18} /></button>
            </div>

            {/* Tab switcher */}
            <div className="auth-modal-tabs">
              <button
                className={`auth-modal-tab${tab === 'login' ? ' auth-modal-tab--active' : ''}`}
                onClick={() => handleTabSwitch('login')}
              >Đăng nhập</button>
              <button
                className={`auth-modal-tab${tab === 'register' ? ' auth-modal-tab--active' : ''}`}
                onClick={() => handleTabSwitch('register')}
              >Đăng ký</button>
            </div>

            {/* Forms */}
            <div className="auth-modal-body">
              {tab === 'login' ? (
                <form className="auth-form" onSubmit={handleLogin}>
                  <div className="auth-field">
                    <span className="auth-field__icon"><Phone size={16} /></span>
                    <input className="auth-field__input" type="tel" placeholder="Số điện thoại"
                      value={loginForm.phone} onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })} />
                  </div>
                  <div className="auth-field">
                    <span className="auth-field__icon"><Lock size={16} /></span>
                    <input className="auth-field__input" type="password" placeholder="Mật khẩu"
                      value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : <><LogIn size={16} /> Đăng nhập</>}
                  </button>
                  <p className="auth-modal-switch">
                    Chưa có tài khoản?{' '}
                    <button type="button" onClick={() => handleTabSwitch('register')}>Đăng ký ngay</button>
                  </p>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleRegister}>
                  <div className="auth-field">
                    <span className="auth-field__icon"><User size={16} /></span>
                    <input className="auth-field__input" placeholder="Họ và tên"
                      value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} />
                  </div>
                  <div className={`auth-field${phoneStatus === 'taken' ? ' auth-field--error' : phoneStatus === 'free' ? ' auth-field--ok' : ''}`}>
                    <span className="auth-field__icon"><Phone size={16} /></span>
                    <input className="auth-field__input" type="tel" placeholder="Số điện thoại"
                      value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} />
                    {phoneStatus === 'checking' && <span className="auth-field__hint">⏳</span>}
                    {phoneStatus === 'taken' && <span className="auth-field__hint auth-field__hint--err">✕</span>}
                    {phoneStatus === 'free' && <span className="auth-field__hint auth-field__hint--ok">✓</span>}
                  </div>
                  {phoneStatus === 'taken' && (
                    <div className="auth-phone-taken">Số điện thoại này đã được đăng ký</div>
                  )}
                  <div className="auth-field">
                    <span className="auth-field__icon"><Lock size={16} /></span>
                    <input className="auth-field__input" type="password" placeholder="Mật khẩu (tối thiểu 4 ký tự)"
                      value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                  </div>
                  <div className="auth-field">
                    <span className="auth-field__icon"><Lock size={16} /></span>
                    <input className="auth-field__input" type="password" placeholder="Xác nhận mật khẩu"
                      value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} />
                  </div>
                  {error && <div className="auth-error">{error}</div>}
                  <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? 'Đang đăng ký...' : <><UserPlus size={16} /> Tạo tài khoản</>}
                  </button>
                  <p className="auth-modal-switch">
                    Đã có tài khoản?{' '}
                    <button type="button" onClick={() => handleTabSwitch('login')}>Đăng nhập</button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;

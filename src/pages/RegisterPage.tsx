import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.phone, form.password);
      navigate('/search');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Đăng ký thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__circle auth-bg__circle--1" />
        <div className="auth-bg__circle auth-bg__circle--2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo__icon">🚗</div>
          <div className="auth-logo__brand">BOOK RIDE <span>VN</span></div>
          <div className="auth-logo__sub">Đăng ký miễn phí – Đặt xe dễ dàng</div>
        </div>

        <h2 className="auth-title">Tạo tài khoản</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <span className="auth-field__icon"><User size={16} /></span>
            <input
              className="auth-field__input"
              placeholder="Họ và tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <span className="auth-field__icon"><Phone size={16} /></span>
            <input
              className="auth-field__input"
              type="tel"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <span className="auth-field__icon"><Lock size={16} /></span>
            <input
              className="auth-field__input"
              type="password"
              placeholder="Mật khẩu (tối thiểu 4 ký tự)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <span className="auth-field__icon"><Lock size={16} /></span>
            <input
              className="auth-field__input"
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Đang đăng ký...' : <><UserPlus size={16} /> Tạo tài khoản</>}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

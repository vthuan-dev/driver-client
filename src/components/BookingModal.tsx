import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation2, X, ArrowRight } from 'lucide-react';
import { Driver } from '../types';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const REGION_LABELS: Record<string, string> = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
};

interface BookingModalProps {
  driver: Driver | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal = ({ driver, onClose, onSuccess }: BookingModalProps) => {
  const { user } = useAuth();
  const parseRoute = (route: string) => {
    const parts = route.split(/\s*[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF ]+\s*/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) return { from: parts[0], to: parts[parts.length - 1] };
    return { from: route.trim(), to: route.trim() };
  };
  const { from, to } = parseRoute(driver?.route || '');

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    startPoint: from,
    endPoint: to,
    price: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!driver) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.price) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestsAPI.createRequest({
        driverPostId: driver.id,
        name: form.name,
        phone: form.phone,
        startPoint: form.startPoint,
        endPoint: form.endPoint,
        price: parseInt(form.price),
        note: form.note,
        region: driver.region,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Đặt xe thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="sheet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="sheet-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="sheet-handle"><div className="sheet-handle__bar" /></div>

          {/* Header */}
          <div className="sheet-header">
            <span className="sheet-header__title">Đặt xe ngay</span>
            <button className="sheet-header__close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Driver summary */}
          <div className="sheet-driver">
            <div className="sheet-driver__avatar">
              {driver.avatar
                ? <img src={driver.avatar} alt={driver.name} />
                : driver.name.charAt(0).toUpperCase()}
            </div>
            <div className="sheet-driver__info">
              <div className="sheet-driver__name">{driver.name}</div>
              <div className="sheet-driver__route">{driver.route}</div>
            </div>
            <span className="sheet-driver__region-badge">{REGION_LABELS[driver.region]}</span>
          </div>

          {/* Form */}
          <form className="sheet-form" onSubmit={handleSubmit}>

            {/* Thông tin khách — từ tài khoản đã đăng nhập */}
            <div className="sheet-auth-info">
              <div className="sheet-auth-info__avatar">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="sheet-auth-info__detail">
                <div className="sheet-auth-info__name">{user?.name}</div>
                <div className="sheet-auth-info__phone">{user?.phone}</div>
              </div>
              <span className="sheet-auth-info__badge">Đã xác thực ✓</span>
            </div>

            {/* Tuyến đường — read-only từ driver.route */}
            <div className="sheet-route-display">
              <div className="sheet-route-point">
                <MapPin size={14} color="#00b14f" />
                <span>{form.startPoint || driver.route}</span>
              </div>
              {form.endPoint && (
                <>
                  <ArrowRight size={13} color="#94a3b8" style={{flexShrink:0}} />
                  <div className="sheet-route-point">
                    <Navigation2 size={14} color="#f97316" />
                    <span>{form.endPoint}</span>
                  </div>
                </>
              )}
            </div>

            {/* Giá */}
            <div className="sheet-field">
              <label className="sheet-label">Giá thỏa thuận (VNĐ) *</label>
              <div className="sheet-price-wrap">
                <input
                  className="sheet-input sheet-price-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 300.000"
                  value={form.price ? Number(form.price).toLocaleString('vi-VN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                    setForm({ ...form, price: raw });
                  }}
                />
                {form.price && (
                  <span className="sheet-price-badge">
                    {Number(form.price).toLocaleString('vi-VN')} ₫
                  </span>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="sheet-field">
              <label className="sheet-label">Ghi chú</label>
              <textarea
                className="sheet-input sheet-textarea"
                rows={2}
                placeholder="Yêu cầu thêm, số hành khách..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            {error && <div className="sheet-error">{error}</div>}

            <button type="submit" className="sheet-submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'XÁC NHẬN ĐẶT XE ›'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;

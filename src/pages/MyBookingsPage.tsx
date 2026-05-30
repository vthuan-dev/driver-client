import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { requestsAPI } from '../services/api';
import { BookingRequest } from '../types';

const MyBookingsPage = () => {
  const { user, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      openAuth('login');
      return;
    }
    const fetchBookings = async () => {
      try {
        const res = await requestsAPI.getMyRequests();
        setBookings(res.data.requests || []);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          logout();
          navigate('/');
          openAuth('login');
        } else {
          setError('Không thể tải lịch sử đặt xe');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, navigate, logout]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const statusClass = (s: string) => {
    if (s === 'matched') return 'status-badge status-badge--matched';
    if (s === 'completed') return 'status-badge status-badge--completed';
    return 'status-badge status-badge--waiting';
  };
  const statusLabel = (s: string) => {
    if (s === 'matched') return 'Đã ghép xe';
    if (s === 'completed') return 'Hoàn thành';
    return 'Đang chờ';
  };

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header__title">📋 Lịch sử đặt xe</div>
        {user && <div className="page-header__sub">{user.name} – {user.phone}</div>}
      </div>

      <div className="content">
        {error && <div className="sheet-error" style={{ marginBottom: 12 }}>{error}</div>}

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '50%' }} />
                <div className="skeleton" style={{ height: 12, width: '70%' }} />
                <div className="skeleton" style={{ height: 12, width: '35%' }} />
              </div>
            </div>
          ))
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🚗</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Chưa có chuyến nào</p>
            <p style={{ fontSize: 13, marginBottom: 16 }}>Hãy tìm tài xế và đặt chuyến đầu tiên!</p>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#00b14f', color: '#fff', border: 0,
                borderRadius: 12, padding: '10px 20px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              Tìm tài xế ngay
            </button>
          </div>
        ) : (
          <>
            <p className="result-count">Tổng <strong>{bookings.length}</strong> chuyến</p>
            {bookings.map((b) => (
              <div key={b.id} className="booking-card">
                <div className="booking-card__route">
                  {b.startPoint}<span>→</span>{b.endPoint}
                </div>
                <div className="booking-card__meta">{formatDate(b.createdAt)}</div>
                {b.note && (
                  <div className="booking-card__meta" style={{ marginTop: 4, fontStyle: 'italic' }}>
                    📝 {b.note}
                  </div>
                )}
                <div className="booking-card__footer">
                  <span className="booking-card__price">{formatPrice(b.price)}</span>
                  <span className={statusClass(b.status)}>{statusLabel(b.status)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Floating CTA */}
      <button className="floating-cta" onClick={() => navigate('/')}>
        🔍 Tìm thêm tài xế ›
      </button>
    </>
  );
};

export default MyBookingsPage;

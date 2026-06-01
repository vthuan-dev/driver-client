import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import DriverCard from '../components/DriverCard';
import BookingModal from '../components/BookingModal';
import { Driver } from '../types';
import { driversAPI, requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

const isNewDriver = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 3;
const isRecentDriver = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 10;

const REGIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'north', label: '🏔️ Miền Bắc' },
  { value: 'central', label: '🌊 Miền Trung' },
  { value: 'south', label: '🌴 Miền Nam' }
];

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

const SearchPage = () => {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  const doSearch = useCallback(async (kw: string, reg: string) => {
    setLoading(true);
    setError('');
    try {
      const driverParams: { region?: string; keyword?: string } = {};
      if (reg) driverParams.region = reg;
      if (kw.trim()) driverParams.keyword = kw.trim();

      const [driverRes, reqRes] = await Promise.all([
        driversAPI.getDrivers(driverParams),
        kw.trim()
          ? requestsAPI.searchByKeyword(kw.trim(), reg || undefined)
          : Promise.resolve({ data: { requests: [] } })
      ]);
      setDrivers(driverRes.data.drivers || []);
      setRequests(reqRes.data.requests || []);
      setSearched(true);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { doSearch('', ''); }, [doSearch]);

  // Realtime search debounce
  useEffect(() => {
    const t = setTimeout(() => doSearch(keyword, region), 400);
    return () => clearTimeout(t);
  }, [keyword, region, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(keyword, region);
  };

  const handleBookingSuccess = () => {
    setSelectedDriver(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  const totalResults = drivers.length + requests.length;

  return (
    <>
      {/* Sticky search header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef0f2', position: 'sticky', top: 52, zIndex: 20 }}>
        <div style={{ padding: '10px 12px 0' }}>
          <form className="search-bar" style={{ marginBottom: 8 }} onSubmit={handleSearch}>
            <input
              className="search-bar__input"
              placeholder="🔍 Tên tài xế, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="search-bar__btn">Tìm</button>
          </form>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px 10px', scrollbarWidth: 'none' }}>
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              style={{
                flexShrink: 0, border: 0, borderRadius: 999,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: region === r.value ? '#00b14f' : '#e2e8f0',
                color: region === r.value ? '#fff' : '#1e293b',
                boxShadow: region === r.value ? '0 3px 10px rgba(0,177,79,0.2)' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {bookingSuccess && (
          <motion.div className="toast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            ✅ Đặt xe thành công! Tài xế sẽ liên hệ bạn sớm.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="content">
        {error && <div className="sheet-error" style={{ marginBottom: 12 }}>{error}</div>}

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: '100%', height: 140, borderRadius: 12 }} />
            </div>
          ))
        ) : searched && totalResults === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>Không tìm thấy kết quả</p>
            <p style={{ marginTop: 4, fontSize: 12 }}>Thử tên, số điện thoại khác</p>
          </div>
        ) : (
          <>
            {searched && keyword.trim() && (
              <p className="result-count">Tìm thấy <strong>{totalResults}</strong> kết quả cho "<strong>{keyword}</strong>"</p>
            )}

            {/* Driver cards */}
            {drivers.length > 0 && (
              <>
                {requests.length > 0 && <h3 style={{ fontSize: 13, color: '#64748b', margin: '4px 0 8px', fontWeight: 600 }}>🚗 Tài xế</h3>}
                <AnimatePresence>
                  {drivers.map((driver, i) => (
                    <motion.div key={driver.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <DriverCard driver={driver} onBook={(d) => { if (!user) { openAuth('login'); return; } setSelectedDriver(d); }}
                        isNew={isNewDriver(driver.createdAt)} isRecent={isRecentDriver(driver.createdAt)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            )}

            {/* Waiting request cards */}
            {requests.length > 0 && (
              <>
                {drivers.length > 0 && <h3 style={{ fontSize: 13, color: '#64748b', margin: '12px 0 8px', fontWeight: 600 }}>⚡ Cuốc xe đang chờ tài xế</h3>}
                {requests.map((r) => (
                  <div key={r._id ?? r.id} className="req-card">
                    <div className="req-card__top">
                      <span className="req-card__name">{r.name}</span>
                      <span className="req-card__time">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="req-card__phone"><Phone size={12} color="#94a3b8" /> {r.phone}</div>
                    <div className="req-card__route-block">
                      <div className="req-card__route-line">
                        <span className="dot dot--green" />
                        <span className="req-card__connector" />
                        <span className="dot dot--red" />
                      </div>
                      <div className="req-card__route-labels">
                        <span>{r.startPoint}</span>
                        <span>{r.endPoint}</span>
                      </div>
                    </div>
                    {r.note && <div className="req-card__note">📝 {r.note}</div>}
                    <div className="req-card__price-row">
                      Giá: <span className="req-card__price">{Number(r.price).toLocaleString('vi-VN')} VND</span>
                    </div>
                    <button className="driver-card__book-btn" style={{ marginTop: 10 }}
                      onClick={() => {
                        if (!user) { openAuth('login'); return; }
                        setSelectedDriver({ id: r.id, _id: r._id ?? r.id, name: r.name, phone: r.phone,
                          route: `${r.startPoint} ⇌ ${r.endPoint}`, region: r.region, isActive: true,
                          createdAt: r.createdAt, price: r.price, note: r.note });
                      }}>
                      <Phone size={15} strokeWidth={2.2} /> ĐẶT NGAY
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      <BookingModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} onSuccess={handleBookingSuccess} />
    </>
  );
};

export default SearchPage;

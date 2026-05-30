import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DriverCard from '../components/DriverCard';
import BookingModal from '../components/BookingModal';
import { Driver } from '../types';
import { driversAPI } from '../services/api';

const isNewDriver = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 3;
const isRecentDriver = (createdAt: string) => Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 10;

const REGIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'north', label: '🏔️ Miền Bắc' },
  { value: 'central', label: '🌊 Miền Trung' },
  { value: 'south', label: '🌴 Miền Nam' }
];

const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchDrivers = useCallback(async (kw: string, reg: string) => {
    setLoading(true);
    setError('');
    try {
      const params: { region?: string; keyword?: string } = {};
      if (reg) params.region = reg;
      if (kw.trim()) params.keyword = kw.trim();
      const res = await driversAPI.getDrivers(params);
      setDrivers(res.data.drivers || []);
      setSearched(true);
    } catch {
      setError('Không thể tải danh sách tài xế. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all on mount
  useEffect(() => {
    fetchDrivers('', '');
  }, [fetchDrivers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers(keyword, region);
  };

  const handleBookingSuccess = () => {
    setSelectedDriver(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 5000);
  };

  return (
    <>
      {/* Sticky search header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef0f2', position: 'sticky', top: 52, zIndex: 20 }}>
        <div style={{ padding: '10px 12px 0' }}>
          <form className="search-bar" style={{ marginBottom: 8 }} onSubmit={handleSearch}>
            <input
              className="search-bar__input"
              placeholder="🔍 Tuyến đường, tên tài xế..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="search-bar__btn">Tìm</button>
          </form>
        </div>
        {/* Region chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px 10px', scrollbarWidth: 'none' }}>
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRegion(r.value); fetchDrivers(keyword, r.value); }}
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

      {/* Toast */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            ✅ Đặt xe thành công! Tài xế sẽ liên hệ bạn sớm.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver list */}
      <div className="content">
        {error && <div className="sheet-error" style={{ marginBottom: 12 }}>{error}</div>}

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
          ))
        ) : drivers.length === 0 && searched ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>Không tìm thấy tài xế</p>
          </div>
        ) : (
          <>
            {searched && (
              <p className="result-count">Tìm thấy <strong>{drivers.length}</strong> tài xế</p>
            )}
            <AnimatePresence>
              {drivers.map((driver, i) => (
                <motion.div key={driver.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <DriverCard
                    driver={driver}
                    onBook={setSelectedDriver}
                    isNew={isNewDriver(driver.createdAt)}
                    isRecent={isRecentDriver(driver.createdAt)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Booking modal */}
      <BookingModal
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default SearchPage;

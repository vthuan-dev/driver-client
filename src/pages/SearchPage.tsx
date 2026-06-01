import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { Driver } from '../types';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

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

const LIMIT_PER_REGION = 60;

const SearchPage = () => {
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('');
  const [allRequests, setAllRequests] = useState<any[]>([]); // browse list (latest per region)
  const [searchResults, setSearchResults] = useState<any[]>([]); // backend search results
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  const loading = loadingBrowse || loadingSearch;

  // Load data when region tab changes
  const loadRequests = useCallback(async (reg: string) => {
    setLoadingBrowse(true);
    setError('');
    try {
      let combined: any[] = [];
      if (!reg) {
        // "Tất cả": fetch 3 regions in parallel
        const [n, c, s] = await Promise.all([
          requestsAPI.getLatest(LIMIT_PER_REGION, 'north'),
          requestsAPI.getLatest(LIMIT_PER_REGION, 'central'),
          requestsAPI.getLatest(LIMIT_PER_REGION, 'south'),
        ]);
        combined = [
          ...(n.data?.requests || []),
          ...(c.data?.requests || []),
          ...(s.data?.requests || []),
        ];
      } else {
        const res = await requestsAPI.getLatest(LIMIT_PER_REGION, reg);
        combined = res.data?.requests || [];
      }
      // Sort by createdAt desc, deduplicate by id
      const seen = new Set<number>();
      const deduped = combined
        .filter(r => { const id = r._id ?? r.id; if (seen.has(id)) return false; seen.add(id); return true; })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllRequests(deduped);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoadingBrowse(false);
    }
  }, []);

  useEffect(() => { loadRequests(region); }, [region, loadRequests]);

  // Backend search when keyword changes
  useEffect(() => {
    if (!keyword.trim()) { setSearchResults([]); return; }
    setLoadingSearch(true);
    const t = setTimeout(async () => {
      try {
        const res = await requestsAPI.searchByKeyword(keyword.trim(), region || undefined);
        const raw: any[] = res.data?.requests || [];
        setSearchResults(raw.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, region]);

  const filtered = keyword.trim() ? searchResults : allRequests;

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
          <form className="search-bar" style={{ marginBottom: 8 }} onSubmit={e => e.preventDefault()}>
            <input
              className="search-bar__input"
              placeholder="🔍 Tên, SĐT, tỉnh/thành phố..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="button" className="search-bar__btn" onClick={() => {}}>Tìm</button>
          </form>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 12px 10px', scrollbarWidth: 'none' }}>
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => { setRegion(r.value); setKeyword(''); }}
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

        {!loading && (
          <p className="result-count" style={{ marginBottom: 8 }}>
            {keyword.trim()
              ? <>Tìm thấy <strong>{filtered.length}</strong> kết quả cho "<strong>{keyword}</strong>"</>
              : <><strong>{allRequests.length}</strong> cuốc xe đang chờ tài xế</>
            }
          </p>
        )}

        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: '100%', height: 150, borderRadius: 12 }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>{keyword.trim() ? 'Không tìm thấy kết quả' : 'Chưa có cuốc xe nào'}</p>
          </div>
        ) : (
          filtered.map((r, i) => (
            <motion.div key={r._id ?? r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <div className="req-card">
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
            </motion.div>
          ))
        )}
      </div>

      <BookingModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} onSuccess={handleBookingSuccess} />
    </>
  );
};

export default SearchPage;

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation2, ArrowUpDown, Phone } from 'lucide-react';
import ProvinceInput from '../components/ProvinceInput';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../context/AuthModalContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { driversAPI, requestsAPI } from '../services/api';
import { Driver } from '../types';
import DriverCard from '../components/DriverCard';
import BookingModal from '../components/BookingModal';

type Region = 'north' | 'central' | 'south';

const REGION_TABS: { value: Region; label: string }[] = [
  { value: 'north', label: '🏔️ Miền Bắc' },
  { value: 'central', label: '🌊 Miền Trung' },
  { value: 'south', label: '🌴 Miền Nam' },
];

const PROVINCES_BY_REGION: Record<Region, string[]> = {
  north: ['Tất cả (Miền Bắc)','Hà Nội','Hải Phòng','Quảng Ninh','Hải Dương','Hưng Yên','Vĩnh Phúc','Bắc Ninh','Thái Bình','Nam Định','Hà Nam','Ninh Bình','Bắc Giang','Bắc Kạn','Cao Bằng','Hà Giang','Lạng Sơn','Lào Cai','Phú Thọ','Sơn La','Điện Biên','Lai Châu','Yên Bái','Tuyên Quang','Thái Nguyên','Hòa Bình'],
  central: ['Tất cả (Miền Trung)','Thanh Hóa','Nghệ An','Hà Tĩnh','Quảng Bình','Quảng Trị','Thừa Thiên - Huế','Đà Nẵng','Quảng Nam','Quảng Ngãi','Bình Định','Phú Yên','Khánh Hòa','Ninh Thuận','Bình Thuận','Kon Tum','Gia Lai','Đắk Lắk','Đắk Nông','Lâm Đồng'],
  south: ['Tất cả (Miền Nam)','TP. Hồ Chí Minh','Bình Dương','Đồng Nai','Bà Rịa-Vũng Tàu','Tây Ninh','Bình Phước','Long An','Tiền Giang','Bến Tre','Trà Vinh','Vĩnh Long','Đồng Tháp','An Giang','Kiên Giang','Cần Thơ','Hậu Giang','Sóc Trăng','Bạc Liêu','Cà Mau'],
};

const TICKER_ITEMS = [
  { icon: '📞', text: 'Hỗ trợ 24/7 – Gọi 039 xxxx 99' },
  { icon: '🟢', text: 'Tài xế uy tín đang chờ chuyến' },
  { icon: '⚡', text: 'Kết nối nhanh – An toàn – Tiết kiệm' },
  { icon: '🗺️', text: 'Phủ sóng toàn quốc 63 tỉnh thành' },
];

const isNewDriver = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 1000 * 60 * 60 * 24 * 3;
};
const isRecentDriver = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 1000 * 60 * 10;
};

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();
  const [region, setRegion] = useState<Region>('north');
  const [province, setProvince] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [latestRequests, setLatestRequests] = useState<any[]>([]);
  const activeProvince = province && !province.startsWith('Tất cả') ? province : '';

  useEffect(() => {
    requestsAPI.getLatest(6, region, activeProvince)
      .then(res => setLatestRequests(res.data?.requests || []))
      .catch(() => {});
  }, [region, province]);

  const maskPhone = (p: string) => p.length < 6 ? p : p.slice(0, 3) + ' xxxx ' + p.slice(-3);
  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    const h = Math.floor(diff / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  const fetchDrivers = useCallback(async (reg: Region, fromVal: string, toVal: string, prov: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { region: reg };
      if (fromVal.trim()) params.from = fromVal.trim();
      if (toVal.trim()) params.to = toVal.trim();
      if (prov.trim()) params.keyword = prov.trim();
      const res = await driversAPI.getDrivers(params);
      setDrivers(res.data.drivers || []);
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchDrivers(region, from, to, activeProvince), 300);
    return () => clearTimeout(t);
  }, [region, from, to, province, fetchDrivers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers(region, from, to, activeProvince);
  };

  const handleBookingSuccess = () => {
    setSelectedDriver(null);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  const regionLabel = REGION_TABS.find(r => r.value === region)?.label ?? '';

  return (
    <>
      {/* ── Hero card ── */}
      <div className="hero-card">
        <img src="/images/banner-ctm.png" alt="IRENY BOOK RIDE" className="hero-card__banner-img" />
        <div className="hero-card__ticker-overlay">
          <div className="hero-card__ticker-track">
            {[
              'Đặt xe liên tỉnh nhanh chóng',
              'Hàng trăm tài xế uy tín sẵn sàng',
              'Kết nối tức thì – Giá thỏa thuận',
              'Phủ sóng 63 tỉnh thành toàn quốc',
              user ? `Xin chào, ${user.name.split(' ').pop()} — Đặt xe ngay` : 'Đăng ký miễn phí – Đặt xe dễ dàng',
              'Đặt xe liên tỉnh nhanh chóng',
              'Hàng trăm tài xế uy tín sẵn sàng',
              'Kết nối tức thì – Giá thỏa thuận',
              'Phủ sóng 63 tỉnh thành toàn quốc',
              user ? `Xin chào, ${user.name.split(' ').pop()} — Đặt xe ngay` : 'Đăng ký miễn phí – Đặt xe dễ dàng',
            ].map((text, i) => (
              <span key={i} className="hero-card__ticker-item">{text}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ticker ── */}
      <div className="ticker">
        <div className="ticker__label">Live</div>
        <div className="ticker__scroll">
          <div className="ticker__track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker__item">
                <span className="ticker__dot" />
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="content">
        {/* Search form */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-form__card">
            {/* From field */}
            <ProvinceInput
              label="Điểm đón"
              placeholder="Chọn tỉnh/thành phố..."
              value={from}
              onChange={setFrom}
              Icon={MapPin}
              iconClass="search-form__icon search-form__icon--from"
            />

            {/* Divider + swap */}
            <div className="search-form__mid">
              <div className="search-form__divider" />
              <button
                type="button"
                className="search-form__swap"
                onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}
              >
                <ArrowUpDown size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* To field */}
            <ProvinceInput
              label="Điểm trả"
              placeholder="Chọn tỉnh/thành phố..."
              value={to}
              onChange={setTo}
              Icon={Navigation2}
              iconClass="search-form__icon search-form__icon--to"
            />
          </div>

          <button type="submit" className="search-form__btn">Tìm chuyến</button>
        </form>

        {/* Section heading */}
        <h2 className="section-heading">Tài xế phù hợp</h2>

        {/* Region tabs */}
        <div className="region-tabs">
          {REGION_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`region-tab${region === tab.value ? ' active' : ''}`}
              onClick={() => { setRegion(tab.value); setProvince(''); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Province select */}
        <div className="province-select-wrap">
          <label>Chọn tỉnh/thành phố</label>
          <select
            className="province-select"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            {PROVINCES_BY_REGION[region].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Region label */}
        <p className="region-label">{regionLabel}</p>

        {/* ── Latest waiting requests (only when NOT searching) ── */}
        {!from.trim() && !to.trim() && latestRequests.length > 0 && (
          <>
            <h2 className="section-heading" style={{ marginTop: 8 }}>⚡ Cuốc xe đang chờ tài xế</h2>
            {latestRequests.map((r) => (
              <div key={r._id ?? r.id} className="req-card">
                <div className="req-card__top">
                  <span className="req-card__name">{r.name}</span>
                  <span className="req-card__time">{timeAgo(r.createdAt)}</span>
                </div>
                <div className="req-card__phone">📞 {r.phone}</div>
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
                <button
                  className="driver-card__book-btn"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    if (!user) { openAuth('login'); return; }
                    setSelectedDriver({
                      id: r.id, _id: r._id ?? r.id,
                      name: r.name, phone: r.phone,
                      route: `${r.startPoint} ⇌ ${r.endPoint}`,
                      region: r.region, isActive: true,
                      createdAt: r.createdAt,
                      price: r.price, note: r.note
                    });
                  }}
                >
                  <Phone size={15} strokeWidth={2.2} /> ĐẶT NGAY
                </button>
              </div>
            ))}
          </>
        )}

        {/* Driver list */}
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 12, width: '65%' }} />
              </div>
            </div>
          ))
        ) : drivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <p>Không tìm thấy tài xế phù hợp</p>
            <p style={{ marginTop: 4, fontSize: 12 }}>Thử vùng khác hoặc từ khóa khác</p>
          </div>
        ) : (
          <AnimatePresence>
            {drivers.map((driver, i) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <DriverCard
                  driver={driver}
                  onBook={(d) => {
                    if (!user) { openAuth('login'); return; }
                    setSelectedDriver(d);
                  }}
                  isNew={isNewDriver(driver.createdAt)}
                  isRecent={isRecentDriver(driver.createdAt)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* ── Waiting requests shown BELOW drivers when searching ── */}
        {(from.trim() || to.trim()) && latestRequests.length > 0 && (
          <>
            <h2 className="section-heading" style={{ marginTop: 16 }}>⚡ Cuốc xe đang chờ tài xế</h2>
            {latestRequests.map((r) => (
              <div key={(r._id ?? r.id) + '-b'} className="req-card">
                <div className="req-card__top">
                  <span className="req-card__name">{r.name}</span>
                  <span className="req-card__time">{timeAgo(r.createdAt)}</span>
                </div>
                <div className="req-card__phone">📞 {r.phone}</div>
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
      </div>

      {/* Floating CTA */}
      <button className="floating-cta" onClick={() => !user ? navigate('/register') : undefined}>
        ĐẶT XE NGAY <span style={{ marginLeft: 4 }}>›</span>
      </button>

      {/* Success toast */}
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

      {/* Booking sheet */}
      <BookingModal
        key={selectedDriver?.id ?? 'none'}
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
};

export default LandingPage;

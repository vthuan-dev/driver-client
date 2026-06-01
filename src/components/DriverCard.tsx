import { Phone } from 'lucide-react';
import { Driver } from '../types';

interface DriverCardProps {
  driver: Driver;
  onBook: (driver: Driver) => void;
  isNew?: boolean;
  isRecent?: boolean;
}

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

const DriverCard = ({ driver, onBook, isNew, isRecent }: DriverCardProps) => {
  const parts = driver.route.split(/[⇌↔⇒→\-–|]+/).map(s => s.trim()).filter(Boolean);
  const [from, to] = [parts[0], parts[1]];

  return (
    <div className="req-card">
      {/* Top row: name + badge */}
      <div className="req-card__top">
        <span className="req-card__name">{driver.name}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          {isNew    && <span className="badge-new">⚡ Mới</span>}
          {isRecent && <span className="badge-recent">✅ Vừa xong</span>}
          {!isNew && !isRecent && <span className="driver-card__type-badge">TÀI XẾ</span>}
        </span>
      </div>

      {/* Phone + time */}
      <div className="req-card__phone" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><Phone size={12} color="#94a3b8" /> {driver.phone}</span>
        {driver.createdAt && <span className="req-card__time">{timeAgo(driver.createdAt)}</span>}
      </div>

      {/* Connected route */}
      <div className="req-card__route-block">
        <div className="req-card__route-line">
          <span className="dot dot--green" />
          <span className="req-card__connector" />
          <span className="dot dot--red" />
        </div>
        <div className="req-card__route-labels">
          <span>{from || driver.route}</span>
          <span>{to || from || driver.route}</span>
        </div>
      </div>

      {/* Note */}
      {driver.note && (
        <div className="req-card__note">📝 {driver.note}</div>
      )}

      {/* Price */}
      <div className="req-card__price-row">
        Giá: <span className="req-card__price">
          {driver.price ? Number(driver.price).toLocaleString('vi-VN') + ' VND' : 'Thương lượng'}
        </span>
      </div>

      {/* CTA */}
      <button className="driver-card__book-btn" onClick={() => onBook(driver)}>
        <Phone size={15} strokeWidth={2.2} /> ĐẶT NGAY
      </button>
    </div>
  );
};

export default DriverCard;

import { Phone } from 'lucide-react';
import { Driver } from '../types';

interface DriverCardProps {
  driver: Driver;
  onBook: (driver: Driver) => void;
  isNew?: boolean;
  isRecent?: boolean;
}

const DriverCard = ({ driver, onBook, isNew, isRecent }: DriverCardProps) => {
  const [from, to] = driver.route.split(/[⇌\-–→]+/).map(s => s.trim());

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

      {/* Phone */}
      <div className="req-card__phone">
        <Phone size={12} color="#94a3b8" /> {driver.phone}
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
          <span>{to || '—'}</span>
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

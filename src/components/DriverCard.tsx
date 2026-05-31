import { Phone } from 'lucide-react';
import { Driver } from '../types';

interface DriverCardProps {
  driver: Driver;
  onBook: (driver: Driver) => void;
  isNew?: boolean;
  isRecent?: boolean;
}

const maskPhone = (phone: string) => {
  if (phone.length < 6) return phone;
  return phone.slice(0, 3) + ' xxxx ' + phone.slice(-3);
};

const DriverCard = ({ driver, onBook, isNew, isRecent }: DriverCardProps) => {
  const [from, to] = driver.route.split(/[⇌\-–→]+/).map(s => s.trim());

  return (
    <div className="driver-card">
      {/* Top row: badges */}
      <div className="driver-card__top">
        <div style={{ display: 'flex', gap: 6 }}>
          {isNew    && <span className="badge-new">⚡ Mới</span>}
          {isRecent && <span className="badge-recent">✅ Vừa xong</span>}
          {!isNew && !isRecent && <span className="driver-card__type-badge">TÀI XẾ</span>}
        </div>
      </div>

      {/* Name + phone */}
      <div className="driver-card__name">{driver.name}</div>
      <div className="driver-card__subphone">
        <Phone size={12} color="#94a3b8" />
        <span>Liên hệ: {maskPhone(driver.phone)}</span>
      </div>

      {/* Route with dots */}
      <div className="driver-card__route-dots">
        <div className="driver-card__dot driver-card__dot--from">
          <span className="dot dot--green" />
          <span>{from || driver.route}</span>
        </div>
        {to && (
          <div className="driver-card__dot driver-card__dot--to">
            <span className="dot dot--red" />
            <span>{to}</span>
          </div>
        )}
      </div>

      {/* Note */}
      {driver.note && (
        <div className="driver-card__note">Ghi chú: {driver.note}</div>
      )}

      {/* Price */}
      <div className="driver-card__price-row">
        Giá:{' '}
        <span className="driver-card__price">
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

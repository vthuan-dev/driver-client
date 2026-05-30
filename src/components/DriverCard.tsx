import { Phone, MapPin, Star } from 'lucide-react';
import { Driver } from '../types';

interface DriverCardProps {
  driver: Driver;
  onBook: (driver: Driver) => void;
  isNew?: boolean;
  isRecent?: boolean;
}

const getStars = (id: number) => (((id * 7) % 10) >= 5 ? 5.0 : 4.5);

const DriverCard = ({ driver, onBook, isNew, isRecent }: DriverCardProps) => {
  const rating = getStars(driver.id);
  const [from, to] = driver.route.split(/[⇌\-–→]+/).map(s => s.trim());

  return (
    <div className="driver-card">
      {/* Header band */}
      <div className="driver-card__header">
        <div className="driver-card__header-left">
          <span className="driver-card__type-badge">TÀI XẾ</span>
          {isNew && <span className="badge-new">Mới</span>}
          {isRecent && <span className="badge-recent">Vừa xong</span>}
        </div>
        <span className="driver-card__price">Thương lượng</span>
      </div>

      {/* Body */}
      <div className="driver-card__body">
        {/* Avatar column */}
        <div className="driver-card__avatar-col">
          <div className="driver-card__avatar">
            {driver.avatar
              ? <img src={driver.avatar} alt={driver.name} />
              : driver.name.charAt(0).toUpperCase()}
          </div>
          <div className="driver-card__rating">
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Info column */}
        <div className="driver-card__info">
          <div className="driver-card__name">{driver.name}</div>

          <div className="driver-card__row">
            <MapPin size={13} color="#00b14f" />
            <div className="driver-card__route-detail">
              <span className="driver-card__route-label">Tuyến đường</span>
              <span className="driver-card__route-value">
                {from && to ? <>{from} <span style={{color:'#94a3b8'}}>→</span> {to}</> : driver.route}
              </span>
            </div>
          </div>

          <div className="driver-card__row">
            <Phone size={13} color="#64748b" />
            <span className="driver-card__phone">{driver.phone}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="driver-card__footer">
        <button className="driver-card__book-btn" onClick={() => onBook(driver)}>
          ĐẶT NGAY
        </button>
      </div>
    </div>
  );
};

export default DriverCard;

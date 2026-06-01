import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { LucideIcon } from 'lucide-react';

const ALL_PROVINCES: { region: string; items: string[] }[] = [
  {
    region: '🏔️ Miền Bắc',
    items: ['Hà Nội','Hải Phòng','Quảng Ninh','Hải Dương','Hưng Yên','Vĩnh Phúc','Bắc Ninh','Thái Bình','Nam Định','Hà Nam','Ninh Bình','Bắc Giang','Bắc Kạn','Cao Bằng','Hà Giang','Lạng Sơn','Lào Cai','Phú Thọ','Sơn La','Điện Biên','Lai Châu','Yên Bái','Tuyên Quang','Thái Nguyên','Hòa Bình'],
  },
  {
    region: '🌊 Miền Trung',
    items: ['Thanh Hóa','Nghệ An','Hà Tĩnh','Quảng Bình','Quảng Trị','Thừa Thiên - Huế','Đà Nẵng','Quảng Nam','Quảng Ngãi','Bình Định','Phú Yên','Khánh Hòa','Ninh Thuận','Bình Thuận','Kon Tum','Gia Lai','Đắk Lắk','Đắk Nông','Lâm Đồng'],
  },
  {
    region: '🌴 Miền Nam',
    items: ['TP. Hồ Chí Minh','Bình Dương','Đồng Nai','Bà Rịa-Vũng Tàu','Tây Ninh','Bình Phước','Long An','Tiền Giang','Bến Tre','Trà Vinh','Vĩnh Long','Đồng Tháp','An Giang','Kiên Giang','Cần Thơ','Hậu Giang','Sóc Trăng','Bạc Liêu','Cà Mau'],
  },
];

const REGION_KEY_MAP: Record<string, string> = {
  north: '🏔️ Miền Bắc',
  central: '🌊 Miền Trung',
  south: '🌴 Miền Nam',
};

interface ProvinceInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  Icon: LucideIcon;
  iconClass: string;
  region?: 'north' | 'central' | 'south';
}

const ProvinceInput = ({ label, placeholder, value, onChange, Icon, iconClass, region }: ProvinceInputProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [rect, setRect] = useState<DOMRect | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const updateRect = () => {
    if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (open) updateRect();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const scrollHandler = () => { if (open) updateRect(); };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', scrollHandler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', scrollHandler, true);
    };
  }, [open]);

  // If region prop provided, only show provinces from that region (flat list, no grouping)
  const filteredRegionItems: string[] | null = region
    ? (ALL_PROVINCES.find(g => g.region === REGION_KEY_MAP[region])?.items ?? [])
        .filter(p => !query.trim() || p.toLowerCase().includes(query.toLowerCase()))
    : null;

  const filtered = filteredRegionItems
    ? []
    : ALL_PROVINCES.map(group => ({
        region: group.region,
        items: query.trim()
          ? group.items.filter(p => p.toLowerCase().includes(query.toLowerCase()))
          : group.items,
      })).filter(g => g.items.length > 0);

  const handleSelect = (province: string) => {
    onChange(province);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <div
        className="search-form__field"
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        <Icon size={18} className={iconClass} />
        <div className="search-form__text">
          <span className="search-form__label">{label}</span>
          {open ? (
            <input
              className="search-form__input"
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="search-form__input" style={{ cursor: 'pointer', color: value ? '#111827' : '#cbd5e1' }}>
              {value || placeholder}
            </div>
          )}
        </div>
        {value && !open && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onChange(''); }}
            style={{ border: 0, background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: 16, lineHeight: 1 }}
          >×</button>
        )}
      </div>

      {open && rect && ReactDOM.createPortal(
        <div
          className="province-dropdown"
          style={{
            position: 'fixed',
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
        >
          {filteredRegionItems !== null ? (
            filteredRegionItems.length === 0
              ? <div className="province-dropdown__empty">Không tìm thấy tỉnh</div>
              : filteredRegionItems.map(province => (
                  <button
                    key={province}
                    type="button"
                    className={`province-dropdown__item${value === province ? ' province-dropdown__item--active' : ''}`}
                    onMouseDown={e => { e.preventDefault(); handleSelect(province); }}
                  >
                    {province}
                  </button>
                ))
          ) : filtered.length === 0 ? (
            <div className="province-dropdown__empty">Không tìm thấy tỉnh</div>
          ) : (
            filtered.map(group => (
              <div key={group.region}>
                <div className="province-dropdown__group">{group.region}</div>
                {group.items.map(province => (
                  <button
                    key={province}
                    type="button"
                    className={`province-dropdown__item${value === province ? ' province-dropdown__item--active' : ''}`}
                    onMouseDown={e => { e.preventDefault(); handleSelect(province); }}
                  >
                    {province}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProvinceInput;

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURES = [
  { label: 'Tài xế uy tín', desc: 'Hàng trăm tài xế chuyên nghiệp sẵn sàng đón bạn' },
  { label: 'Kết nối tức thì', desc: 'Xác nhận chuyến đi trong vài giây' },
  { label: 'Minh bạch & an toàn', desc: 'Giá thỏa thuận, hành trình rõ ràng' },
  { label: 'Phủ sóng toàn quốc', desc: '63 tỉnh thành trên cả nước' },
];

const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleBook = () => {
    onClose();
  };

  const handleAuth = () => {
    onClose();
    navigate(user ? '/my-bookings' : '/register');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="welcome-modal"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button className="welcome-modal__close" onClick={onClose} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>✕</button>

            {/* Header */}
            <div className="welcome-modal__header" style={{ padding: '28px 24px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 6 }}>
                Đặt xe liên tỉnh
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                IRENY BOOK RIDE
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 5 }}>
                Tài xế uy tín · Nhanh · An toàn
              </div>
            </div>

            {/* Body */}
            <div className="welcome-modal__body">
              <div className="welcome-modal__actions">
                <button className="welcome-modal__btn-primary" onClick={handleBook}>
                  ĐẶT XE NGAY
                </button>
                <button className="welcome-modal__btn-secondary" onClick={handleAuth}>
                  {user ? `Chuyến của tôi — ${user.name.split(' ').pop()}` : 'Đăng nhập / Đăng ký'}
                </button>
              </div>
              <p className="welcome-modal__skip" onClick={onClose}>Bỏ qua</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;

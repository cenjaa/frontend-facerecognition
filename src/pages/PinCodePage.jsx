import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PNM_BLUE = '#0066b3';
const PNM_GREEN = '#93c01f';
const PNM_DARK = '#1f2937';

export default function PinCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = location.state?.name || 'Admin';
  const userId = location.state?.userId || 0;
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKey = (key) => {
    setError(false);
    if (key === 'X') {
      setPin(pin.slice(0, -1));
    } else if (key === 'Enter') {
      submitPin();
    } else if (pin.length < 6) {
      setPin(pin + key);
    }
  };

  const submitPin = async () => {
    try {
      const res = await fetch('/api/verify_pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, pin }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        navigate('/admin-dashboard', { state: { name: data.name || adminName } });
      } else {
        setError(true);
        setPin('');
      }
    } catch {
      setError(true);
      setPin('');
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'X', '0', 'Enter'];

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)', // Corporate Slate
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      
      {/* ── CORPORATE TOP BAR ── */}
      <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PNM</span>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Sistem Absensi Digital</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'relative', zIndex: 10,
          background: '#fff', borderRadius: 16, padding: '24px 32px',
          width: 380, maxWidth: '90vw',
          boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
          borderTop: `6px solid ${PNM_BLUE}`,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: PNM_DARK, marginBottom: 6 }}>
            Selamat datang, {adminName}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, fontWeight: 500 }}>
            Silahkan masukkan PIN otorisasi
          </p>

          <div style={{
            border: `2px solid ${error ? '#ef4444' : '#cbd5e1'}`,
            borderRadius: 12, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, letterSpacing: 10, marginBottom: 16, fontFamily: 'monospace',
            animation: error ? 'shake 0.4s ease-in-out' : 'none',
            color: PNM_BLUE
          }}>
            {'●'.repeat(pin.length)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {keys.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                style={{
                  height: 48, borderRadius: 10, border: '2px solid #e2e8f0',
                  background: key === 'Enter' ? PNM_GREEN : '#fff', 
                  fontSize: key === 'Enter' ? 14 : 20,
                  fontWeight: 800, cursor: 'pointer',
                  color: key === 'X' ? '#ef4444' : key === 'Enter' ? '#fff' : PNM_DARK,
                  transition: 'all 0.1s',
                  boxShadow: key === 'Enter' ? `0 4px 10px rgba(147, 192, 31, 0.3)` : 'none'
                }}
                onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {key}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ color: '#ef4444', marginTop: 12, fontSize: 13, fontWeight: 600, marginBottom: 0 }}>
              PIN salah. Silahkan coba lagi.
            </p>
          )}

          <button
            onClick={() => navigate('/')}
            style={{ marginTop: 16, color: '#94a3b8', fontSize: 13, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', padding: '8px 16px', fontWeight: 500 }}
          >
            Batal & Kembali
          </button>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
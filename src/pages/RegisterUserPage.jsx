import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'simple-keyboard/build/css/index.css';

const PNM_BLUE = '#0066b3';
const PNM_DARK = '#1f2937';

export default function RegisterUserPage() {
  const navigate = useNavigate();
  const [nip, setNip] = useState('');
  const keyboardRef = useRef(null);

  const onKeyPress = (button) => {
    if (button === '{bksp}') {
      setNip(prev => prev.slice(0, -1));
    } else if (button === '{space}') {
      setNip(prev => prev + ' ');
    } else if (button === '{shift}' || button === '{lock}') {
      // handle shift
    } else {
      setNip(prev => prev + button);
    }
  };

  const handleNext = () => {
    if (nip.trim()) {
      navigate('/register-face', { state: { nip: nip.trim() } });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Custom CSS to shrink keyboard height for 7-inch screens */}
      <style>{`
        .simple-keyboard.hg-theme-default .hg-button {
          height: 40px !important; 
          font-size: 16px !important;
          align-items: center;
          display: flex;
          justify-content: center;
          font-weight: 600;
          color: ${PNM_DARK};
        }
      `}</style>

      {/* ── CORPORATE TOP BAR ── */}
      <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PNM</span>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Manajemen Karyawan</span>
        </div>
        <button onClick={() => navigate('/admin-dashboard')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
          Kembali ke Dashboard
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '16px 32px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: PNM_DARK, margin: 0 }}>
          Registrasi Karyawan Baru
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500, margin: '4px 0 0' }}>
          Langkah 1: Identifikasi NIP
        </p>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', gap: 16 }}>

        {/* Instruction */}
        <p style={{ fontSize: 15, color: '#475569', fontWeight: 600, textAlign: 'center', margin: 0 }}>
          Ketik NIP Karyawan yang ingin didaftarkan ke sistem
        </p>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: `2px solid ${nip ? PNM_BLUE : '#cbd5e1'}`, borderRadius: 10, width: 400, maxWidth: '90%', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'border 0.3s ease' }}>
          <input
            type="text"
            value={nip}
            readOnly
            placeholder="Masukkan NIP..."
            style={{ flex: 1, padding: '10px 16px', fontSize: 16, fontWeight: 700, border: 'none', outline: 'none', color: nip ? PNM_DARK : '#94a3b8' }}
          />
          <div style={{ padding: '0 16px', fontSize: 18, color: nip ? PNM_BLUE : '#cbd5e1' }}>🔍</div>
        </div>

        {/* Virtual Keyboard */}
        <div style={{ width: 700, maxWidth: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: 5, overflow: 'hidden' }}>
          <Keyboard
            keyboardRef={(r) => (keyboardRef.current = r)}
            onKeyPress={onKeyPress}
            layout={{
              default: [
                '` 1 2 3 4 5 6 7 8 9 0 - =',
                'Q W E R T Y U I O P [ ]',
                'A S D F G H J K L ; \'',
                'Z X C V B N M , . / {bksp}',
              ],
            }}
            display={{
              '{bksp}': '⌫',
            }}
            theme="simple-keyboard hg-theme-default"
          />
        </div>
      </div>

      {/* Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 32px 20px' }}>
        <button
          onClick={handleNext}
          disabled={!nip.trim()}
          style={{
            padding: '10px 40px', fontSize: 16, fontWeight: 700,
            border: 'none', borderRadius: 8,
            background: nip.trim() ? PNM_BLUE : '#e2e8f0',
            color: nip.trim() ? '#fff' : '#94a3b8',
            cursor: nip.trim() ? 'pointer' : 'default',
            boxShadow: nip.trim() ? `0 4px 12px rgba(0, 102, 179, 0.3)` : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Selanjutnya ➔
        </button>
      </div>
    </div>
  );
}
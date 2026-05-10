import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/* ── Corporate Colors ────── */
const PNM_BLUE = '#0066b3';
const PNM_GREEN = '#93c01f';
const PNM_DARK = '#1f2937';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = location.state?.name || 'Admin';
  
  // ── ORIGINAL BACKEND LOGIC ──
  const [stats, setStats] = useState({ totalUsers: 0, hadir: 0 });
  const [modelUpToDate, setModelUpToDate] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [uRes, dRes] = await Promise.all([fetch('/api/users'), fetch('/api/dashboard_stats')]);
        const u = await uRes.json();
        const d = await dRes.json();
        setStats({ totalUsers: u.users?.length || 0, hadir: d.total_hadir || 0 });
      } catch {}
    })();
  }, []);

  const handleTrain = async () => {
    setIsTraining(true);
    setTrainMessage('Melatih model...');
    try {
      const res = await fetch('/api/train_model', { method: 'POST' });
      const data = await res.json();
      setTrainMessage(data.status === 'started' || data.status === 'success' ? 'Training selesai!' : 'Gagal');
      
      if (data.status === 'started' || data.status === 'success') {
        // Slight delay so the user can read "Training selesai!" before the card switches
        setTimeout(() => setModelUpToDate(true), 1000); 
      }
    } catch { 
      setTrainMessage('Gagal'); 
    }
    setIsTraining(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── CORPORATE TOP BAR ── */}
      <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PNM</span>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Dashboard Administrator</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Keluar Sistem
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: PNM_DARK, margin: 0, lineHeight: 1.2 }}>
            Selamat Datang,
          </h1>
          <p style={{ fontSize: 22, fontWeight: 800, color: PNM_BLUE, margin: '2px 0 8px' }}>
            {adminName}
          </p>
          <p style={{ fontSize: 15, color: '#64748b', fontWeight: 500, margin: 0 }}>
            Ringkasan data absensi dan manajemen sistem AI.
          </p>
        </div>

        {/* Layout Split */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* LEFT COLUMN — Stats + Model (50% Width) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Corporate Stats Card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', borderTop: `4px solid ${PNM_BLUE}` }}>
              <div style={{ display: 'flex', gap: 40 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PNM_BLUE }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>User Terdaftar</span>
                  </div>
                  <p style={{ fontSize: 48, fontWeight: 900, color: PNM_DARK, margin: 0, lineHeight: 1 }}>
                    {stats.totalUsers}
                  </p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PNM_GREEN }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>User Hadir</span>
                  </div>
                  <p style={{ fontSize: 48, fontWeight: 900, color: PNM_DARK, margin: 0, lineHeight: 1 }}>
                    {stats.hadir}
                  </p>
                </div>
              </div>
            </div>

            {/* Corporate Model Status Card */}
            {modelUpToDate ? (
              <div style={{ 
                background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f6ec 100%)', 
                border: `2px solid #b2db62`, borderRadius: 16, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: PNM_DARK, margin: '0 0 4px' }}>
                    Sistem AI Optimal
                  </p>
                  <p style={{ fontSize: 13, color: '#475569', margin: 0, fontWeight: 500 }}>
                    Model pengenalan wajah sudah up-to-date.
                  </p>
                </div>
                <div style={{ width: 40, height: 40, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: PNM_GREEN, fontSize: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  ✔
                </div>
              </div>
            ) : (
              <div style={{ 
                background: '#fffbeb', border: '2px solid #fcd34d', borderRadius: 16, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: '#92400e', margin: '0 0 4px' }}>
                    Pembaruan Diperlukan
                  </p>
                  <p style={{ fontSize: 13, color: '#b45309', margin: 0, fontWeight: 500 }}>
                    Terdapat data wajah baru.
                  </p>
                </div>
                <button
                  onClick={handleTrain}
                  disabled={isTraining}
                  style={{ 
                    padding: '8px 20px', border: 'none', borderRadius: 8, 
                    fontSize: 14, fontWeight: 700, background: '#f59e0b', color: '#fff', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)', minWidth: 120
                  }}
                >
                  {isTraining ? 'Training...' : (trainMessage || 'Update Model')}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Add New User Card (50% Width) */}
          <button
            onClick={() => navigate('/register-user')}
            style={{
              flex: 1, 
              height: 250, 
              background: PNM_DARK, borderRadius: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', border: `3px solid ${PNM_BLUE}`,
              boxShadow: `0 12px 30px rgba(0, 102, 179, 0.25)`,
              cursor: 'pointer', padding: '16px',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
            }}
            onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" stroke={PNM_GREEN} strokeWidth="3" />
                <line x1="22" y1="11" x2="16" y2="11" stroke={PNM_GREEN} strokeWidth="3" />
              </svg>
            </div>
            
            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: 0.5 }}>
              Registrasi Karyawan Baru
            </h3>
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0, padding: '0 16px', lineHeight: 1.4, fontWeight: 500 }}>
              Daftarkan data wajah dan NIP karyawan ke dalam sistem AI.
            </p>
          </button>
          
        </div>
      </div>
    </div>
  );
}
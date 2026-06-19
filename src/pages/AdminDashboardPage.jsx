import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE, { API_KEY } from '../apiConfig';

/* ── Corporate Colors ────── */
const PNM_BLUE = '#0066b3';
const PNM_GREEN = '#93c01f';
const PNM_DARK = '#1f2937';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiAdminName, setApiAdminName] = useState(location.state?.name || 'Admin');
  const [stats, setStats] = useState({ totalUsers: 0, hadir: 0 });
  const [modelUpToDate, setModelUpToDate] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const adminId = localStorage.getItem('pnm_admin_id');
        const token = localStorage.getItem('pnm_admin_token');
        if (!adminId || !token) return;

        const res = await fetch(`${API_BASE}/api/admin_dashboard/${adminId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-API-Key': API_KEY
          }
        });
        const data = await res.json();

        if (data.admin_name) setApiAdminName(data.admin_name);
        setStats({
          totalUsers: data.total_users || 0,
          hadir: data.today_attendees || 0
        });
        setModelUpToDate(!data.needs_retrain);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    })();
  }, []);

  const handleTrain = async () => {
    const token = localStorage.getItem('pnm_admin_token');
    try {
      const res = await fetch(`${API_BASE}/api/train_model`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': API_KEY
        }
      });
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
            {apiAdminName}
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

          {/* RIGHT COLUMN — Add New User Card (50% Width) - NOW IN PNM BLUE */}
          <button
            onClick={() => navigate('/register-user')}
            style={{
              flex: 1,
              height: 250,
              background: PNM_BLUE, // Vibrant Corporate Blue
              borderRadius: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', border: 'none',
              boxShadow: `0 8px 24px rgba(0, 102, 179, 0.35)`, // Smooth glowing shadow
              cursor: 'pointer', padding: '16px',
              transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 102, 179, 0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 179, 0.35)';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 179, 0.2)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 179, 0.35)';
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {/* Entirely white SVG icon for maximum contrast */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" stroke="#fff" strokeWidth="3" />
                <line x1="22" y1="11" x2="16" y2="11" stroke="#fff" strokeWidth="3" />
              </svg>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', letterSpacing: 0.5 }}>
              Registrasi Karyawan Baru
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', margin: 0, padding: '0 16px', lineHeight: 1.4, fontWeight: 500 }}>
              Daftarkan data wajah dan NIP karyawan ke dalam sistem AI.
            </p>
          </button>

        </div>
      </div>
    </div>
  );
}
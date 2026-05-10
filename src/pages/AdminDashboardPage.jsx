import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminName = location.state?.name || 'Admin';
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
      if (data.status === 'started' || data.status === 'success') setModelUpToDate(true);
    } catch { setTrainMessage('Gagal'); }
    setIsTraining(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '48px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.2 }}>
          Selamat Datang,
        </h1>
        <p style={{ fontSize: 24, fontWeight: 500, color: '#888', fontStyle: 'italic', margin: 0 }}>
          {adminName}
        </p>
      </div>

      <p style={{ fontSize: 16, color: '#999', fontStyle: 'italic', marginBottom: 24 }}>
        Apa yang anda ingin lakukan hari ini?
      </p>

      {/* Content */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* Left — Stats + Model (50% Width) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Stats Row */}
          <div style={{ display: 'flex', gap: 48, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} />
                <span style={{ fontSize: 15, color: '#555' }}>Total User Terdaftar</span>
              </div>
              <p style={{ fontSize: 56, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1 }}>
                {stats.totalUsers}
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 15, color: '#555' }}>Total User Hadir</span>
              </div>
              <p style={{ fontSize: 56, fontWeight: 900, color: '#111', margin: 0, lineHeight: 1 }}>
                {stats.hadir}
              </p>
            </div>
          </div>

          {/* Model Status */}
          {modelUpToDate ? (
            <div style={{ 
              background: '#dcfce7', border: '2px solid #86efac', borderRadius: 16, padding: '20px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' 
            }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8, margin: 0 }}>
                Model yang dipakai sudah up-to-date
              </p>
              <span style={{ fontSize: 36, marginTop: 8 }}>✅</span>
            </div>
          ) : (
            <div style={{ 
              background: '#fef9c3', border: '2px solid #fcd34d', borderRadius: 16, padding: '20px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' 
            }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 12, margin: 0 }}>
                Model ML belum up-to date
              </p>
              <button
                onClick={handleTrain}
                disabled={isTraining}
                style={{ 
                  padding: '8px 24px', border: '2px solid #111', borderRadius: 10, 
                  fontSize: 15, fontWeight: 700, background: '#fff', cursor: 'pointer' 
                }}
              >
                {isTraining ? 'Training...' : 'Update Model'}
              </button>
            </div>
          )}
        </div>

        {/* Right — Add New User Card (50% Width) */}
        <button
          onClick={() => navigate('/register-user')}
          style={{
            flex: 1, 
            height: 280, // Fixed height optimized for a 7-inch screen so it doesn't stretch
            background: '#111', borderRadius: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#fff', border: '4px solid rgba(99,102,241,0.5)',
            boxShadow: '6px 6px 0 rgba(99,102,241,0.3)',
            cursor: 'pointer', padding: '16px'
          }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" style={{ marginBottom: 16, opacity: 0.5 }}>
            <circle cx="42" cy="28" r="18" fill="#999" />
            <path d="M14 90 C14 62 28 50 42 50 C56 50 70 62 70 90" fill="#999" />
            <circle cx="75" cy="55" r="14" fill="none" stroke="#999" strokeWidth="5" />
            <line x1="75" y1="45" x2="75" y2="65" stroke="#999" strokeWidth="5" strokeLinecap="round" />
            <line x1="65" y1="55" x2="85" y2="55" stroke="#999" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <h3 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Add New User</h3>
          <p style={{ fontSize: 14, color: '#aaa', textAlign: 'center', margin: 0, padding: '0 16px', lineHeight: 1.4 }}>
            Karyawan baru dapat daftar wajah pada laman ini
          </p>
        </button>
      </div>

      {/* Back */}
      <button onClick={() => navigate('/')} style={{ marginTop: 16, color: '#aaa', fontSize: 13, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
        ← Kembali ke Laman Utama
      </button>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';

const PNM_BLUE = '#0066b3';
const PNM_GREEN = '#93c01f';
const PNM_DARK = '#1f2937';

const POSES = [
  { label: 'Menghadap ke depan', img: '/poses/Depan.png', next: 'samping kiri' },
  { label: 'Menghadap ke kiri', img: '/poses/Kiri.png', next: 'samping kanan' },
  { label: 'Menghadap ke kanan', img: '/poses/Kanan.png', next: 'menunduk' },
  { label: 'Menunduk ke bawah', img: '/poses/Bawah.png', next: 'mendongak' },
  { label: 'Mendongak ke atas', img: '/poses/Atas.png', next: null },
];

export default function RegisterFacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const nip = location.state?.nip || '';
  const [userId, setUserId] = useState(null);
  const [currentPose, setCurrentPose] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isCapturing, setIsCapturing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [capturedBlobs, setCapturedBlobs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { videoRef, isReady: cameraReady, error: cameraError, captureBlob } = useCamera(!completed);

  useEffect(() => {
    const createUser = async () => {
      try {
        const res = await fetch('/api/create_user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nip, name: 'Karyawan Baru', email: '' })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setUserId(data.user_id);
        }
      } catch (err) {
        console.error("Create user API error:", err);
      }
    };
    if (nip) createUser();
  }, [nip]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => {
      if (countdown === 1) {
        setIsCapturing(true);
        setCountdown(null);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const uploadDataset = async (blobs) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      blobs.forEach((blob, i) => fd.append('files', blob, `${i}.jpg`));
      
      const res = await fetch(`/api/dataset/${userId}`, { method: 'POST', body: fd });
      if (res.ok) setCompleted(true);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (capturedBlobs.length === 0 || isUploading) return;
    const target = (currentPose + 1) * 10;
    
    if (capturedBlobs.length >= target) {
      setIsCapturing(false);
      if (currentPose + 1 >= POSES.length) {
         if (!completed) uploadDataset(capturedBlobs);
      } else {
         setCurrentPose(p => p + 1);
         setCountdown(3);
      }
    }
  }, [capturedBlobs.length, currentPose, completed, isUploading]);

  useEffect(() => {
    if (!isCapturing || !cameraReady || !userId) return;
    let isActive = true;

    const captureFrame = async () => {
      if (!isActive) return;
      try {
        const blob = await captureBlob();
        if (blob) {
          const fd = new FormData();
          fd.append('file', blob);
          
          const res = await fetch('/api/infer', { method: 'POST', body: fd });
          const data = await res.json();
          
          if (data.status === 'success' && data.detected && data.box) {
             const [x, y, w, h] = data.box;
             const canvas = document.createElement('canvas');
             canvas.width = 100; canvas.height = 100;
             const ctx = canvas.getContext('2d');
             
             const img = new Image();
             const url = URL.createObjectURL(blob);
             
             await new Promise((resolve) => {
               img.onload = () => {
                 ctx.drawImage(img, x, y, w, h, 0, 0, 100, 100);
                 canvas.toBlob((croppedBlob) => {
                   setCapturedBlobs(prev => {
                     if (prev.length >= (currentPose + 1) * 10) return prev;
                     return [...prev, croppedBlob];
                   });
                   resolve();
                 }, 'image/jpeg', 0.9);
               };
               img.src = url;
             });
             URL.revokeObjectURL(url);
          }
        }
      } catch (err) { console.error(err); }
      if (isActive) setTimeout(captureFrame, 200);
    };
    
    captureFrame();
    return () => { isActive = false; };
  }, [isCapturing, cameraReady, userId, captureBlob, currentPose]);

  /* ── Success Screen ── */
  if (completed) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f6ec 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PNM</span>
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Manajemen Karyawan</span>
          </div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderTop: `6px solid ${PNM_GREEN}`, borderRadius: 16, padding: '40px 60px', textAlign: 'center', maxWidth: 460, boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', color: PNM_GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>✔</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: PNM_DARK, marginBottom: 8 }}>Data Berhasil Disimpan</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 28, fontWeight: 500 }}>Wajah Karyawan ({nip}) kini dapat dikenali oleh sistem absensi.</p>
            <button
              onClick={() => navigate('/admin-dashboard')}
              style={{ width: '100%', maxWidth: 280, padding: '12px 0', background: PNM_BLUE, color: '#fff', borderRadius: 8, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: `0 4px 12px rgba(0, 102, 179, 0.3)` }}
            >
              Selesai & Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Capture Screen ── */
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── CORPORATE TOP BAR ── */}
      <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>PNM</span>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Manajemen Karyawan</span>
        </div>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>NIP: {nip}</span>
      </div>

      <div style={{ padding: '16px 32px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: PNM_DARK, margin: 0 }}>Registrasi Wajah</h1>
        <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500, margin: '4px 0 0' }}>Langkah 2: Ikuti panduan pemindaian sistem</p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 24, padding: '16px 32px 24px', minHeight: 0 }}>
        <div style={{
          width: 220, flexShrink: 0,
          background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
        }}>
          <p style={{ color: PNM_BLUE, fontWeight: 800, fontSize: 13, marginBottom: 12, alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Posisi Wajib
          </p>
          <img src="/poses/Depan.png" alt="Depan" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 12, opacity: currentPose === 0 ? 1 : 0.25, filter: currentPose === 0 ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' : 'none' }} />
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <img src="/poses/Kiri.png" alt="Kiri" style={{ width: 60, height: 60, objectFit: 'contain', opacity: currentPose === 1 ? 1 : 0.25 }} />
            <img src="/poses/Kanan.png" alt="Kanan" style={{ width: 60, height: 60, objectFit: 'contain', opacity: currentPose === 2 ? 1 : 0.25 }} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <img src="/poses/Bawah.png" alt="Bawah" style={{ width: 60, height: 60, objectFit: 'contain', opacity: currentPose === 3 ? 1 : 0.25 }} />
            <img src="/poses/Atas.png" alt="Atas" style={{ width: 60, height: 60, objectFit: 'contain', opacity: currentPose === 4 ? 1 : 0.25 }} />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <div style={{
            flex: 1, background: PNM_DARK, borderRadius: 12, overflow: 'hidden',
            position: 'relative', border: '4px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            </div>

            <div className="animate-pulse-dot" style={{ position: 'absolute', top: 12, right: 12, width: 14, height: 14, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444' }} />

            {!cameraReady && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                {cameraError || 'Memulai kamera...'}
              </div>
            )}
            
            {countdown !== null && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,102,179,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 72, fontWeight: 900, color: '#fff', textShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  {countdown}<span style={{ fontSize: 32, fontWeight: 500 }}>s</span>
                </span>
              </div>
            )}
          </div>

          {/* Pose instruction bar */}
          <div style={{ marginTop: 12, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 10, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', flexShrink: 0 /* ADDED: Prevents the instruction bar from shrinking */ }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: PNM_DARK, margin: 0 }}>
              {isUploading ? "Memproses Data..." : (countdown !== null ? `Siapkan posisi: ${POSES[currentPose].next || 'Selesai'}` : POSES[currentPose].label)}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: 8, width: 100, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: PNM_GREEN, width: `${(capturedBlobs.length / 50) * 100}%`, transition: 'width 0.2s' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: PNM_BLUE, margin: 0, minWidth: 80, textAlign: 'right' }}>
                {capturedBlobs.length} / 50
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
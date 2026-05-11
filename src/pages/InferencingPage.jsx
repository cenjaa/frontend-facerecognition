import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';

/* ── Corporate Gradients per status ────── */
const THEMES = {
  standby: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 100%)', // Corporate Slate to White
  success: 'linear-gradient(135deg, #f0fdf4 0%, #e6f6ec 100%)', // Subtle PNM Green Tint
  error: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',   // Subtle Error Red Tint
};

/* ── Corporate Colors ────── */
const PNM_BLUE = '#0066b3';
const PNM_GREEN = '#93c01f';
const PNM_DARK = '#1f2937';

/* ── Admin Login Modal ──────────────────────────── */
function AdminLoginModal({ onClose, onResult }) {
  const { videoRef, isReady, error, captureBlob } = useCamera(true);

  useEffect(() => {
    if (!isReady) return;
    let isRunning = true;

    const inferLoop = async () => {
      if (!isRunning) return;

      try {
        const blob = await captureBlob();
        // Check if video is actually ready for drawing
        if (blob && videoRef.current && videoRef.current.readyState >= 2) {
          const formData = new FormData();
          formData.append('file', blob, 'admin.jpg');

          // Ensure this matches your new Python @app.post("/api/infer")
          const res = await fetch('/api/infer', { method: 'POST', body: formData });
          const data = await res.json();

          if (data.status === 'success' && data.detected && data.confidence >= 40.0) {
            const nameRes = await fetch(`/api/user_name/${data.user_id}`);
            const nameData = await nameRes.json();
            onResult(true, data.user_id, nameData.name || `User ${data.user_id}`);
            isRunning = false;
            return;
          }
        }
      } catch (err) {
        console.error('Admin inference error:', err);
      }

      if (isRunning) setTimeout(inferLoop, 1500);
    };

    const timer = setTimeout(inferLoop, 1000);
    return () => { isRunning = false; clearTimeout(timer); };
  }, [isReady]); // Only restart if the camera itself restarts

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
      <div className="bg-white rounded-[16px] shadow-2xl w-[480px] max-w-[90vw] p-6 text-center border-t-[6px]" style={{ borderColor: PNM_BLUE, animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 4 }}>Otorisasi Admin</h2>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.4, marginBottom: 16 }}>
          Silahkan scan wajah untuk membuktikan identitas administrator.
        </p>
        <div style={{ width: '100%', aspectRatio: '16/9', background: PNM_DARK, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '2px solid #e2e8f0' }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
          {!isReady && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {error || 'Memulai kamera...'}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{ marginTop: 16, color: '#999', fontSize: 14, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', padding: '8px 16px' }}>
          Batal
        </button>
      </div>
    </div>
  );
}

/* ── Admin Error Modal ──────────────────────────── */
function AdminErrorModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', width: 340, maxWidth: '85vw', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', borderTop: '6px solid #ef4444', animation: 'popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div style={{ padding: '32px 24px 24px' }}>
          <div style={{ width: 60, height: 60, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444', fontSize: 28 }}>
            ✕
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>Akses Ditolak</h3>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>Wajah tidak terdaftar sebagai administrator sistem.</p>
          <button onClick={onClose} style={{ width: '100%', padding: '12px 0', background: '#ef4444', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Corporate Face Icon SVG ── */
function FaceIcon() {
  return (
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
      <svg width="40" height="46" viewBox="0 0 60 70">
        <circle cx="30" cy="22" r="14" fill="#cbd5e1" />
        <rect x="20" y="14" width="18" height="16" rx="2" fill="none" stroke={PNM_GREEN} strokeWidth="2.5" />
        <rect x="14" y="40" width="32" height="22" rx="8" fill={PNM_BLUE} />
      </svg>
    </div>
  );
}

export default function InferencingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('standby');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recognizedUser, setRecognizedUser] = useState(null);
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminError, setShowAdminError] = useState(false);
  const [isInferencing, setIsInferencing] = useState(false);
  const adminTapTimer = useRef(null);
  const prevFrameData = useRef(null);
  const { videoRef: mainCameraRef, isReady: cameraReady, error: cameraError, captureBlob } = useCamera(!showAdminLogin);
  
  const prevFrameRef = useRef(null);
  const motionCanvasRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const checkMotion = (videoElement) => {
  if (!videoElement || videoElement.readyState < 2 || videoElement.videoWidth === 0 || videoElement.currentTime === 0) return false;

  if (!motionCanvasRef.current) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = 64;
    newCanvas.height = 48;
    newCanvas.style.position = 'fixed';
    newCanvas.style.top = '-100px';
    newCanvas.style.opacity = '0.001';
    newCanvas.style.pointerEvents = 'none';
    document.body.appendChild(newCanvas);
    motionCanvasRef.current = newCanvas;
  }
  
  const canvas = motionCanvasRef.current;
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;

  // Use the most explicit drawImage call to help the Pi's GPU drivers
  ctx.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const currentFrame = imageData.data;

  // Check if we are actually getting any data (if first few pixels are all 0, signal might be dead)
  let hasData = false;
  for (let i = 0; i < 100; i += 4) {
    if (currentFrame[i] > 0 || currentFrame[i+1] > 0 || currentFrame[i+2] > 0) {
      hasData = true;
      break;
    }
  }

  if (!prevFrameRef.current) {
    prevFrameRef.current = new Uint8ClampedArray(currentFrame);
    setDebugMotionScore(`0.00% ${hasData ? '(Signal OK)' : '(NO SIGNAL)'}`);
    return false;
  }

  let diffPixels = 0;
  const prevFrame = prevFrameRef.current;

  for (let i = 0; i < currentFrame.length; i += 4) {
    const diff = (Math.abs(currentFrame[i] - prevFrame[i]) +
                  Math.abs(currentFrame[i+1] - prevFrame[i+1]) +
                  Math.abs(currentFrame[i+2] - prevFrame[i+2])) / 3;

    if (diff > 35) { // Slightly more sensitive
      diffPixels++;
    }
  }

  prevFrameRef.current = new Uint8ClampedArray(currentFrame);

  const totalPixels = width * height;
  const motionScore = (diffPixels / totalPixels) * 100;
  
  return motionScore > 0.3;
};

  useEffect(() => {
    if (status !== 'standby' || !cameraReady) return;
    let isRunning = true;

    const inferLoop = async () => {
      if (!isRunning) return;

      try {
        const hasMotion = checkMotion(mainCameraRef.current);
        if (hasMotion) {
          const blob = await captureBlob();
          if (blob) {
            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');

            setIsInferencing(true);
            const inferStartTime = Date.now();
            
            const [res] = await Promise.all([
              fetch('/api/infer', { method: 'POST', body: formData }),
              new Promise(r => setTimeout(r, 1000))
            ]);
            
            const data = await res.json();
            setIsInferencing(false);

            if (data.status === 'success' && data.detected) {
              const latency = Date.now() - inferStartTime;

              if (data.confidence >= 50.0) {
                const authRes = await fetch('/api/attendance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: data.user_id,
                    presence_time: new Date().toISOString(),
                    confidence: data.confidence,
                    latency_ms: latency,
                    status_id: 1 
                  })
                });

                if (authRes.ok) {
                  const nameRes = await fetch(`/api/user_name/${data.user_id}`);
                  const nameData = await nameRes.json();

                  setRecognizedUser({
                    name: nameData.name || `User ${data.user_id}`,
                    confidence: data.confidence,
                    latency: latency
                  });
                  setStatus('success');
                } else {
                  console.error('Go backend attendance error');
                  setStatus('error');
                }
              } else {
                setStatus('error');
              }
            }
          }
        }
      } catch (err) {
        console.error('Inference error:', err);
      }
      if (isRunning) setTimeout(inferLoop, 1500);
    };

    const timer = setTimeout(inferLoop, 1000);
    return () => { isRunning = false; clearTimeout(timer); };
  }, [status, cameraReady]); // Removed captureBlob and mainCameraRef to be safe

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const t = setTimeout(() => { setStatus('standby'); setRecognizedUser(null); }, 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleAdminTap = () => {
    setAdminTapCount((prev) => {
      const n = prev + 1;
      clearTimeout(adminTapTimer.current);
      if (n >= 3) {
        setShowAdminLogin(true);
        return 0;
      }
      adminTapTimer.current = setTimeout(() => setAdminTapCount(0), 1000);
      return n;
    });
  };

  const timeStr = currentTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  }).replace(/\./g, ':');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* ── 1. CORPORATE TOP BAR ── */}
      <div style={{ height: 60, background: PNM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', zIndex: 50, position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo with 3-tap admin trigger */}
          <img 
            src="/logo/Logo_PNM.png" 
            alt="PNM Logo" 
            onClick={handleAdminTap}
            style={{ height: 40, cursor: 'pointer', userSelect: 'none' }} 
          />
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>Sistem Absensi Digital</span>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        
        {/* ── ANIMATED BACKGROUND LAYERS (Preserved logic) ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {Object.entries(THEMES).map(([themeKey, gradient]) => (
            <div
              key={themeKey}
              style={{
                position: 'absolute', inset: 0, background: gradient,
                opacity: status === themeKey ? 1 : 0,
                transition: 'opacity 0.7s ease-in-out',
                willChange: 'opacity', transform: 'translateZ(0)' // GPU optimization
              }}
            />
          ))}
        </div>

        {/* ── LAYOUT WRAPPER (Stays exactly the same) ── */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex' }}>
          
          {/* ── LEFT PANEL (Typography & Cards Refined) ── */}
          <div style={{ width: '45%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 32px' }}>
            
            <h1 style={{ fontSize: 36, fontWeight: 900, color: PNM_DARK, lineHeight: 1.1, marginBottom: 4 }}>
              Selamat Datang
            </h1>
            <p style={{ fontSize: 16, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>
              Di Lingkungan PNM Tower
            </p>

            {/* Branded Clock */}
            <p style={{ fontSize: 56, fontWeight: 900, color: PNM_BLUE, letterSpacing: '-1px', lineHeight: 1.1, margin: '16px 0 24px' }}>
              {timeStr}
            </p>

            {status === 'standby' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, animation: 'fadeIn 0.5s ease-out' }}>
                <FaceIcon />
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 16, lineHeight: 1.4, maxWidth: 160, fontWeight: 500 }}>
                  Arahkan wajah Anda ke layar untuk absensi
                </p>
              </div>
            )}

            {status === 'success' && (
              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: 320, borderTop: `6px solid ${PNM_GREEN}`, animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: PNM_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Absensi Berhasil
                  <span style={{ color: PNM_GREEN, display: 'inline-block', animation: 'bounceIcon 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}>✔</span>
                </h3>
                <p style={{ fontSize: 18, fontWeight: 800, color: PNM_BLUE }}>
                  {recognizedUser?.name || 'Farchan Putra Indrianto'}
                </p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                  Divisi Aplikasi Teknologi Informasi
                </p>
              </div>
            )}

            {status === 'error' && (
              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: 320, borderTop: '6px solid #ef4444', animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: PNM_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Tidak Dikenali
                  <span style={{ color: '#ef4444', display: 'inline-block', animation: 'bounceIcon 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}>✕</span>
                </h3>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>Wajah Tidak Terdaftar</p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.4, fontWeight: 500 }}>
                  Silahkan hubungi PIC absensi atau coba lagi dengan posisi yang jelas.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL — Camera (Layout Preserved) ── */}
          <div style={{ width: '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 32px 24px 0' }}>
            <div style={{
              width: '100%', height: '100%', maxHeight: '82vh', // Adjusted slightly to fit below top-bar
              background: PNM_DARK, borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
              border: '4px solid #fff', // Crisp premium white border around the dark camera feed
              position: 'relative',
            }}>
              <video ref={mainCameraRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              
              {!cameraReady && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                  {cameraError || 'Memulai kamera perangkat...'}
                </div>
              )}

              {/* Branded Status Overlay Badge */}
              <div style={{
                position: 'absolute', top: 16, left: 16,
                background: isInferencing ? `rgba(147, 192, 31, 0.9)` : `rgba(0, 102, 179, 0.85)`, // Toggles between PNM Green and PNM Blue
                backdropFilter: 'blur(4px)',
                padding: '6px 14px', borderRadius: 50,
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
                boxShadow: isInferencing ? `0 0 12px rgba(147, 192, 31, 0.4)` : 'none'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#fff',
                  opacity: isInferencing ? 1 : 0.6,
                  animation: isInferencing ? 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                }} />
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                  {isInferencing ? 'Menganalisa...' : 'Siap Memindai'}
                </span>
              </div>

              {isInferencing && (
                <div style={{
                  position: 'absolute', top: '20%', left: '25%', right: '25%', bottom: '20%',
                  border: `2px solid rgba(147, 192, 31, 0.8)`, borderRadius: 16,
                  boxShadow: `0 0 15px rgba(147, 192, 31, 0.2)`,
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: `rgba(147, 192, 31, 0.8)`,
                    boxShadow: `0 0 8px rgba(147, 192, 31, 0.6)`,
                    animation: 'scan 1.5s linear infinite'
                  }} />
                </div>
              )}
            </div>
          </div>
        </div> 
      </div> {/* End Main Area */}



      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onResult={(success, userId, name) => {
            if (success) {
              // Store admin ID for created_by tracking
              localStorage.setItem('pnm_admin_id', userId);
              localStorage.setItem('pnm_admin_name', name);
              navigate('/pin-code', { state: { userId, name } });
            }
            setShowAdminLogin(false);
          }}
        />
      )}
      {showAdminError && <AdminErrorModal onClose={() => setShowAdminError(false)} />}

      {/* ── CSS Keyframes ── */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes bounceIcon {
          0% { transform: scale(0); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
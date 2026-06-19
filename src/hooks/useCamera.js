import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook to access the device camera via MediaDevices API.
 * Works on Raspberry Pi's Chromium with USB/CSI camera.
 *
 * @param {boolean} active - Whether the camera should be active
 * @param {object} constraints - Optional MediaStreamConstraints overrides
 * @returns {{ videoRef, stream, error, isReady }}
 */
export function useCamera(active = true, constraints = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsReady(false);
      return;
    }

    let cancelled = false;

    const startCamera = async () => {
      // Small delay to allow hardware to release (Critical for Pi 4 stability)
      await new Promise(r => setTimeout(r, 500));
      if (cancelled) return;

      try {
        const mediaConstraints = {
          video: {
            facingMode: 'user',
            width: 640,
            height: 480,
            ...constraints,
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsReady(true);
          };
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Camera access failed:', err);
          setError(err.message || 'Camera access denied');
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsReady(false);
    };
  }, [active]);

  /**
   * Capture a single frame from the video as a base64 JPEG.
   * @returns {string|null} Base64-encoded JPEG data URL
   */
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !isReady) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, [isReady]);

  /**
   * Capture a frame as a Blob for sending to API.
   * @returns {Promise<Blob|null>}
   */
  const captureBlob = useCallback(() => {
    if (!videoRef.current || !isReady) return Promise.resolve(null);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  }, [isReady]);

  return { videoRef, stream: streamRef.current, error, isReady, captureFrame, captureBlob };
}

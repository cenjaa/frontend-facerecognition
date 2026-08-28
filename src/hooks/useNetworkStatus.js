import { useState, useEffect, useRef } from 'react';
import API_BASE from '../apiConfig';

/**
 * Hook that monitors real internet connectivity.
 * Uses navigator.onLine + periodic API ping to detect true connectivity.
 *
 * @param {number} pingIntervalMs - How often to ping the API (default 15s)
 * @returns {{ isOnline: boolean }}
 */
export function useNetworkStatus(pingIntervalMs = 15000) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const intervalRef = useRef(null);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch(`${API_BASE}/api/health`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        clearTimeout(timeout);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    const handleOnline = () => checkConnectivity();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkConnectivity();

    // Periodic ping
    intervalRef.current = setInterval(checkConnectivity, pingIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalRef.current);
    };
  }, [pingIntervalMs]);

  return { isOnline };
}

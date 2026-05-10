import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AdminLoginPage — Standalone fallback route.
 * In the main flow, admin login is handled via modal inside InferencingPage.
 * This page redirects to / if accessed directly.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to inferencing page where the admin flow lives
    navigate('/');
  }, [navigate]);

  return null;
}

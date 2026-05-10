import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InferencingPage from './pages/InferencingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import PinCodePage from './pages/PinCodePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegisterUserPage from './pages/RegisterUserPage';
import RegisterFacePage from './pages/RegisterFacePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InferencingPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/pin-code" element={<PinCodePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/register-user" element={<RegisterUserPage />} />
        <Route path="/register-face" element={<RegisterFacePage />} />
      </Routes>
    </Router>
  );
}

export default App;

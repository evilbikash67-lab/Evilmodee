import { useState, useEffect } from 'react';
import AdminLogin from '../components/Admin/Login';
import AdminDashboard from '../components/Admin/Dashboard';
import { fetchAdminSettings } from '../utils/api';

export default function AdminPanel() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [configs, setConfigs] = useState({});

  useEffect(() => {
    if (token) {
      fetchAdminSettings(token)
        .then(setConfigs)
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
        });
    }
  }, [token]);

  if (!token) {
    return <AdminLogin onLogin={(t) => { setToken(t); localStorage.setItem('admin_token', t); }} />;
  }

  return <AdminDashboard token={token} configs={configs} setConfigs={setConfigs} />;
}

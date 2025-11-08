import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { authService, LoginResponse } from '@/services/authService';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    setError('');
    try {
      const response: LoginResponse = await authService.login({ email: username, password });
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.user.role === 'admin') {
        if (location.pathname !== '/sistema/admin') {
          navigate('/sistema/admin', { replace: true });
        }
      } else if (response.user.role === 'customer') {
        if (location.pathname !== '/profissional/admin') {
          navigate('/profissional/admin', { replace: true });
        }
      } else {
        setError('Unauthorized role.');
        return false;
      }
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errMsg);
      return false;
    }
  };

  return <AdminLogin onLogin={handleLogin} error={error} />;
};

export default AdminLoginPage; 
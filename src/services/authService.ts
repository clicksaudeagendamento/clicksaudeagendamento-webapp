import { apiRequest } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  accepted: boolean;
  plan: {
    name: string;
    price: number;
    credits: number;
  };
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>({
      method: 'POST',
      path: '/auth/login',
      data: payload
    });
  },

  logout: (): void => {
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = '/login';
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  sendVerificationCode: async (phone: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>({
      method: 'POST',
      path: '/auth/send-verification-code',
      data: { phone }
    });
  },

  verifyCode: async (phone: string, code: string): Promise<{ message: string; success: boolean }> => {
    return apiRequest<{ message: string; success: boolean }>({
      method: 'POST',
      path: '/auth/verify-code',
      data: { phone, code }
    });
  }
}; 
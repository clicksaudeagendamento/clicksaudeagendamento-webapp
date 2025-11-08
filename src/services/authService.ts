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
  }
}; 
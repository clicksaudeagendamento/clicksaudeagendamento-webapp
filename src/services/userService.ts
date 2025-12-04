import { apiRequest } from './api';

export interface RegisterUserPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  registration?: string;
  address?: string;
  workingHours?: string;
  description?: string;
  website?: string;
  instagram?: string;
  accepted?: boolean;
}

export interface RegisterUserResponse {
  success: boolean;
  id?: string | number;
  message?: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  accepted: boolean;
  trialEndDate: string | null;
  plan: {
    name: string;
    price: number;
    credits: number;
  } | null;
  createdAt: string;
  updatedAt: string;
  specialty?: string;
  registration?: string;
  address?: string;
  workingHours?: string;
  description?: string;
  website?: string;
  instagram?: string;
}

export const userService = {
  registerUser: async (payload: RegisterUserPayload): Promise<void> => {
    return apiRequest<void>({
      method: 'POST',
      path: '/users',
      data: payload
    });
  },

  getCurrentUserProfile: async (token: string): Promise<User> => {
    return apiRequest<User>({
      method: 'GET',
      path: '/users/profile/me',
      token
    });
  },

  getAllUsers: async (token: string): Promise<User[]> => {
    return apiRequest<User[]>({
      method: 'GET',
      path: '/users',
      token
    });
  },

  getUserById: async (id: string, token: string): Promise<User> => {
    return apiRequest<User>({
      method: 'GET',
      path: `/users/${id}`,
      token
    });
  },

  getUserProfileById: async (id: string): Promise<User> => {
    return apiRequest<User>({
      method: 'GET',
      path: `/users/profile/${id}`,
    });
  },

  updateUserById: async (id: string, payload: UpdateUserPayload, token: string): Promise<void> => {
    return apiRequest<void>({
      method: 'PUT',
      path: `/users/${id}`,
      data: payload,
      token
    });
  },

  removeUser: async (id: string, token: string): Promise<void> => {
    return apiRequest<void>({
      method: 'DELETE',
      path: `/users/${id}`,
      token
    });
  }
}; 
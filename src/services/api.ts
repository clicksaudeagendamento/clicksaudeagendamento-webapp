const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  data?: unknown;
  token?: string;
  headers?: Record<string, string>;
}

export async function apiRequest<T = unknown>({ method = 'GET', path, data, token, headers = {} }: ApiRequestOptions): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  if (token) {
    (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, fetchOptions);
  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = undefined;
  }
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
      
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }
    throw new Error(responseBody?.message || 'API request failed');
  }
  return responseBody;
}

export const apiService = {
  // Schedule endpoints
  createSchedule: async (data: any) => {
    // Mock implementation
    console.log('Mock API: Creating schedule', data);
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, id: Date.now() }), 500);
    });
  },

  deleteSchedule: async (scheduleId: string) => {
    console.log('Mock API: Deleting schedule', scheduleId);
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 300);
    });
  },

  deleteTimeSlot: async (scheduleId: string, slotId: string) => {
    console.log('Mock API: Deleting time slot', { scheduleId, slotId });
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 300);
    });
  },

  // Appointment endpoints
  cancelAppointment: async (scheduleId: string, slotId: string) => {
    console.log('Mock API: Canceling appointment', { scheduleId, slotId });
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 400);
    });
  },

  bookAppointment: async (data: any) => {
    console.log('Mock API: Booking appointment', data);
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true, id: Date.now() }), 600);
    });
  }
};

export default apiService;
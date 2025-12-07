import { apiRequest } from './api';

export interface BookAppointmentPayload {
  scheduleId: string;
  slotId: string;
  patient: {
    name: string;
    phone: string;
  };
}

export interface CreateAppointmentPayload {
  schedule: string;
  patientName: string;
  primaryPhone: string;
}

export interface AppointmentResponse {
  success: boolean;
  id?: string | number;
  message?: string;
}

export interface Patient {
  name: string;
  primaryPhone: string;
  _id: string;
}

export interface Professional {
  fullName: string;
  specialty: string;
  registration: string;
  address: string;
  workingHours: string;
}

export interface Appointment {
  _id: string;
  status: string;
  patient: Patient;
  createdAt: string;
  updatedAt: string;
  __v: number;
  scheduleId: string;
  scheduleDateTime: string;
  addressId?: string;
  professional: Professional;
}

export const appointmentService = {
  bookAppointment: async (payload: BookAppointmentPayload) => {
    return apiRequest<AppointmentResponse>({
      method: 'POST',
      path: '/appointments',
      data: payload
    });
  },

  createAppointment: async (payload: CreateAppointmentPayload) => {
    return apiRequest<AppointmentResponse>({
      method: 'POST',
      path: '/appointments',
      data: payload
    });
  },
  
  cancelAppointment: async (appointmentId: string, token: string) => {
    return apiRequest<AppointmentResponse>({
      method: 'DELETE',
      path: `/appointments/${appointmentId}`,
      token
    });
  },

  getAppointmentsByMonth: async (month: string, token: string, addressId?: string): Promise<Appointment[]> => {
    const path = addressId 
      ? `/appointments?month=${month}&addressId=${addressId}`
      : `/appointments?month=${month}`;
    return apiRequest<Appointment[]>({
      method: 'GET',
      path,
      token
    });
  }
}; 
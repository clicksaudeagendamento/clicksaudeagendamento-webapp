import { apiRequest } from './api';

export interface CreateSchedulePayload {
  date: string; // ISO date string
  timeSlots: string[]; // Array of time strings like "13:00"
}

export interface ScheduleResponse {
  success: boolean;
  id?: string | number;
  message?: string;
}

export interface DeleteScheduleResponse {
  deleted: boolean;
}

export interface DeleteScheduleByDateResponse {
  deleted: boolean;
  deletedCount: number;
  date: string;
}

export type CreateScheduleResponse = Schedule[];

export interface Schedule {
  _id: string;
  user: string;
  status: string;
  dateTime: string;
  appointment: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PublicSchedule {
  _id: string;
  status: string;
  dateTime: string;
  date: string;
  time: string;
}

export const scheduleService = {
  createSchedule: async (payload: CreateSchedulePayload, token: string) => {
    return apiRequest<CreateScheduleResponse>({
      method: 'POST',
      path: '/schedules',
      data: payload,
      token
    });
  },
  
  deleteSchedule: async (date: string, token: string): Promise<DeleteScheduleByDateResponse> => {
    return apiRequest<DeleteScheduleByDateResponse>({
      method: 'DELETE',
      path: `/schedules?date=${date}`,
      token
    });
  },
  
  deleteTimeSlot: async (scheduleId: string, token: string) => {
    return apiRequest<ScheduleResponse>({
      method: 'DELETE',
      path: `/schedules/${scheduleId}`,
      token
    });
  },

  getSchedulesByMonth: async (month: string, token: string): Promise<Schedule[]> => {
    return apiRequest<Schedule[]>({
      method: 'GET',
      path: `/schedules?month=${month}`,
      token
    });
  },

  getPublicSchedules: async (userId: string, month: number, year: number): Promise<PublicSchedule[]> => {
    return apiRequest<PublicSchedule[]>({
      method: 'GET',
      path: `/schedules/public?userId=${userId}&month=${month}&year=${year}`,
    });
  },
}; 
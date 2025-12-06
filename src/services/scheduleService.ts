import { apiRequest } from './api';

export interface RecurrenceConfig {
  enabled: boolean;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  occurrences?: number; // Number of times to repeat (e.g., 3 for 3 weeks)
}

export interface CreateSchedulePayload {
  // Legacy support
  date?: string; // ISO date string
  
  // New fields
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string (optional, for date range)
  
  timeSlots: string[]; // Array of time strings like "13:00"
  addressId?: string; // Optional address ID
  recurrence?: RecurrenceConfig; // Optional recurrence configuration
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

  getSchedulesByMonth: async (month: string, token: string, addressId?: string): Promise<Schedule[]> => {
    const path = addressId 
      ? `/schedules?month=${month}&addressId=${addressId}`
      : `/schedules?month=${month}`;
    return apiRequest<Schedule[]>({
      method: 'GET',
      path,
      token
    });
  },

  getPublicSchedules: async (userId: string, month: number, year: number, addressId?: string): Promise<PublicSchedule[]> => {
    const path = addressId
      ? `/schedules/public?userId=${userId}&month=${month}&year=${year}&addressId=${addressId}`
      : `/schedules/public?userId=${userId}&month=${month}&year=${year}`;
    return apiRequest<PublicSchedule[]>({
      method: 'GET',
      path,
    });
  },
}; 
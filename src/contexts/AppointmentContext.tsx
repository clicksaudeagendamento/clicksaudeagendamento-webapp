
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { timeValidation } from '@/utils/timeValidation';
import { appointmentService, Appointment } from '@/services/appointmentService';
import { userService, User } from '@/services/userService';


export type AppointmentStatus = 'criado' | 'confirmado' | 'realizado' | 'cancelado';

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  patientName?: string;
  patientPhone1?: string;
  patientPhone2?: string;
  status?: AppointmentStatus;
}

export interface Schedule {
  id: string;
  date: Date;
  timeSlots: TimeSlot[];
}

export interface ProfessionalProfile {
  name: string;
  specialty: string;
  register: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  profileImage?: string;
  primaryColor: string;
}

export interface AppointmentContextType {
  schedules: Schedule[];
  apiAppointments: Appointment[];
  profile: ProfessionalProfile;
  loading: boolean;
  apiLoading: boolean;
  getAvailableSlots: (date: Date) => TimeSlot[];
  bookAppointment: (date: Date, time: string, patientData: { name: string; phone1: string; phone2: string }) => Promise<boolean>;
  confirmAppointment: (scheduleId: string, slotId: string) => Promise<void>;
  setAppointmentStatus: (scheduleId: string, slotId: string, status: AppointmentStatus) => void;
  createSchedule: (date: Date, timeSlots: string[]) => Promise<void>;
  getAppointments: () => Schedule[];
  deleteSchedule: (scheduleId: string) => Promise<void>;
  deleteTimeSlot: (scheduleId: string, slotId: string) => Promise<void>;
  cancelAppointment: (scheduleId: string, slotId: string) => Promise<void>;
  fetchAppointmentsByMonth: (month: string) => Promise<void>;
  getAppointmentsForDate: (date: Date) => Appointment[];
  updateProfile: (profile: ProfessionalProfile) => void;
  updatePrimaryColor: (color: string) => void;
  canEditSchedule: (date: Date) => boolean;
  canCancelAppointment: (date: Date, time: string) => boolean;
  setProfile: (profile: ProfessionalProfile) => void;
  getProfileByRegister: (register: string) => ProfessionalProfile | null;
  getProfileByPhoneNumber: (phoneNumber: string) => ProfessionalProfile | null;
  fetchUserProfile: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Generate fake schedules for all Thursdays in June and July 2025
const generateFakeSchedules = (): Schedule[] => {
  const schedules: Schedule[] = [];
  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  
  // June 2025 Thursdays: 5, 12, 19, 26
  // July 2025 Thursdays: 3, 10, 17, 24, 31
  const thursdays = [
    new Date(2025, 5, 5),   // June 5
    new Date(2025, 5, 12),  // June 12
    new Date(2025, 5, 19),  // June 19
    new Date(2025, 5, 26),  // June 26
    new Date(2025, 6, 3),   // July 3
    new Date(2025, 6, 10),  // July 10
    new Date(2025, 6, 17),  // July 17
    new Date(2025, 6, 24),  // July 24
    new Date(2025, 6, 31),  // July 31
  ];

  thursdays.forEach((date, index) => {
    const slots: TimeSlot[] = timeSlots.map((time, slotIndex) => {
      // Simulate some booked appointments
      const isBooked = Math.random() < 0.3; // 30% chance of being booked
      return {
        id: `${index}-${slotIndex}`,
        time,
        isAvailable: !isBooked,
        ...(isBooked && {
          patientName: `Paciente ${Math.floor(Math.random() * 100)}`,
          patientPhone1: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
        }),
      };
    });

    schedules.push({
      id: `schedule-${index}`,
      date,
      timeSlots: slots,
    });
  });

  return schedules;
};

export const AppointmentProvider = ({ children }: { children: ReactNode }) => {
  const [schedules, setSchedules] = useState<Schedule[]>(generateFakeSchedules());
  const [apiAppointments, setApiAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile>({
    name: 'Dr. Maria Silva',
    specialty: 'Cardiologista',
    register: 'CRM 12345',
    address: 'Rua das Flores, 123 - Centro - São Paulo/SP',
    phone: '(11) 99999-9999',
    email: 'profissional@email.com.br',
    workingHours: 'Segunda a Sexta: 8h às 18h',
    primaryColor: '#3B82F6',
  });

  const canEditSchedule = (date: Date): boolean => {
    return !timeValidation.isPastDateTime(date);
  };

  const canCancelAppointment = (date: Date, time: string): boolean => {
    return timeValidation.isAtLeast2HoursFromNow(date, time);
  };

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('access_token') || '';
  };

  // Fetch appointments from API
  const fetchAppointmentsByMonth = useCallback(async (month: string) => {
    const token = getToken();
    if (!token) {
      console.error('Token de autenticação não encontrado');
      return;
    }

    setApiLoading(true);
    try {
      const appointments = await appointmentService.getAppointmentsByMonth(month, token);
      setApiAppointments(appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setApiLoading(false);
    }
  }, []);

  // Get appointments for a specific date
  const getAppointmentsForDate = useCallback((date: Date): Appointment[] => {
    return apiAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduleDateTime);
      
      // Compare dates by year, month, and day only (ignoring time)
      const appointmentYear = appointmentDate.getFullYear();
      const appointmentMonth = appointmentDate.getMonth();
      const appointmentDay = appointmentDate.getDate();
      
      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth();
      const targetDay = date.getDate();
      
      return appointmentYear === targetYear && 
             appointmentMonth === targetMonth && 
             appointmentDay === targetDay;
    });
  }, [apiAppointments]);

  const getAvailableSlots = (date: Date): TimeSlot[] => {
    const schedule = schedules.find(
      s => s.date.toDateString() === date.toDateString()
    );
    return schedule?.timeSlots.filter(slot => 
      slot.isAvailable && timeValidation.isAtLeast30MinutesFromNow(date, slot.time)
    ) || [];
  };

  const bookAppointment = async (date: Date, time: string, patientData: { name: string; phone1: string; phone2: string }): Promise<boolean> => {
    if (!timeValidation.isAtLeast30MinutesFromNow(date, time)) {
      throw new Error('Agendamento deve ser feito com pelo menos 30 minutos de antecedência');
    }

    setLoading(true);
    try {
      await apiService.bookAppointment({ date, time, patientData });
      setSchedules(prev => prev.map(schedule => {
        if (schedule.date.toDateString() === date.toDateString()) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.map(slot => {
              if (slot.time === time && slot.isAvailable) {
                return {
                  ...slot,
                  isAvailable: false,
                  patientName: patientData.name,
                  patientPhone1: patientData.phone1,
                  patientPhone2: patientData.phone2,
                  status: 'criado',
                };
              }
              return slot;
            }),
          };
        }
        return schedule;
      }));
      return true;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirmação do agendamento pelo paciente
  const confirmAppointment = async (scheduleId: string, slotId: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === scheduleId) {
        return {
          ...schedule,
          timeSlots: schedule.timeSlots.map(slot =>
            slot.id === slotId ? { ...slot, status: 'confirmado' } : slot
          ),
        };
      }
      return schedule;
    }));
  };

  // Atualizar status manualmente (útil para realizado/cancelado)
  const setAppointmentStatus = (scheduleId: string, slotId: string, status: AppointmentStatus) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === scheduleId) {
        return {
          ...schedule,
          timeSlots: schedule.timeSlots.map(slot =>
            slot.id === slotId ? { ...slot, status } : slot
          ),
        };
      }
      return schedule;
    }));
  };

  const createSchedule = async (date: Date, timeSlots: string[]) => {
    if (timeValidation.isPastDateTime(date)) {
      throw new Error('Não é possível criar agenda para datas passadas');
    }

    setLoading(true);
    try {
      const response = await apiService.createSchedule({ date, timeSlots }) as { success: boolean; id: string | number };
      
      const newSchedule: Schedule = {
        id: `schedule-${response.id}`,
        date,
        timeSlots: timeSlots.map((time, index) => ({
          id: `${response.id}-${index}`,
          time,
          isAvailable: true,
        })),
      };
      setSchedules(prev => [...prev.filter(s => s.date.toDateString() !== date.toDateString()), newSchedule]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule && timeValidation.isPastDateTime(schedule.date)) {
      throw new Error('Não é possível excluir agendas passadas');
    }

    setLoading(true);
    try {
      await apiService.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeSlot = async (scheduleId: string, slotId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const slot = schedule?.timeSlots.find(s => s.id === slotId);
    
    if (schedule && slot && !timeValidation.isAtLeast30MinutesFromNow(schedule.date, slot.time)) {
      throw new Error('Não é possível excluir horários com menos de 30 minutos de antecedência');
    }

    setLoading(true);
    try {
      await apiService.deleteTimeSlot(scheduleId, slotId);
      setSchedules(prev => prev.map(schedule => {
        if (schedule.id === scheduleId) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.filter(slot => slot.id !== slotId),
          };
        }
        return schedule;
      }));
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (scheduleId: string, slotId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const slot = schedule?.timeSlots.find(s => s.id === slotId);
    
    if (schedule && slot && !timeValidation.isAtLeast2HoursFromNow(schedule.date, slot.time)) {
      throw new Error('Não é possível cancelar agendamentos com menos de 2 horas de antecedência');
    }

    setLoading(true);
    try {
      await apiService.cancelAppointment(scheduleId, slotId);
      setSchedules(prev => prev.map(schedule => {
        if (schedule.id === scheduleId) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.map(slot => {
              if (slot.id === slotId) {
                return {
                  ...slot,
                  isAvailable: true,
                  patientName: undefined,
                  patientPhone1: undefined,
                  patientPhone2: undefined,
                  status: 'cancelado',
                };
              }
              return slot;
            }),
          };
        }
        return schedule;
      }));
    } finally {
      setLoading(false);
    }
  };

  const getAppointments = (): Schedule[] => {
    return schedules.filter(schedule => 
      schedule.timeSlots.some(slot => !slot.isAvailable)
    );
  };

  const updateProfile = (newProfile: ProfessionalProfile) => {
    setProfile(newProfile);
  };

  const updatePrimaryColor = (color: string) => {
    setProfile(prev => ({ ...prev, primaryColor: color }));
    // Update CSS custom property
    document.documentElement.style.setProperty('--primary', `${parseInt(color.slice(1, 3), 16)} ${parseInt(color.slice(3, 5), 16)} ${parseInt(color.slice(5, 7), 16)}`);
  };

  const fetchUserProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.error('Token de autenticação não encontrado');
      return;
    }

    try {
      const userData = await userService.getCurrentUserProfile(token);
      
      // Format phone from API response (e.g., "5585993857466" to "(85) 99385-7466")
      const formatPhoneFromAPI = (phone: string) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
          return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        }
        return phone;
      };

      // Map API user data to ProfessionalProfile format
      const mappedProfile: ProfessionalProfile = {
        name: userData.fullName,
        specialty: userData.specialty || '',
        register: userData.registration || '',
        address: userData.address || '',
        phone: formatPhoneFromAPI(userData.phone),
        email: userData.email,
        workingHours: userData.workingHours || '',
        profileImage: undefined, // API doesn't provide this yet
        primaryColor: '#3B82F6', // Default color
      };
      
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  const value: AppointmentContextType = {
    schedules,
    apiAppointments,
    profile,
    loading,
    apiLoading,
    getAvailableSlots,
    bookAppointment,
    confirmAppointment,
    setAppointmentStatus,
    createSchedule,
    getAppointments,
    deleteSchedule,
    deleteTimeSlot,
    cancelAppointment,
    fetchAppointmentsByMonth,
    getAppointmentsForDate,
    updateProfile,
    updatePrimaryColor,
    canEditSchedule,
    canCancelAppointment,
    setProfile,
    getProfileByRegister: (register: string) => {
      // Simula busca de profissional por registro
      // Em um sistema real, isso seria uma consulta ao banco de dados
      if (register.toLowerCase().includes('crm') || register.toLowerCase().includes('cro')) {
        return profile;
      }
      return null;
    },
    getProfileByPhoneNumber: (phoneNumber: string) => {
      // Simula busca de profissional por número de telefone
      // Em um sistema real, isso seria uma consulta ao banco de dados
      if (profile.phone === phoneNumber || profile.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, '')) {
        return profile;
      }
      return null;
    },
    fetchUserProfile,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};

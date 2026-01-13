import { apiRequest } from './api';

export interface DashboardMetrics {
  activeProfessionals: number;
  todayAppointments: number;
  monthlyRevenue: number;
}

export interface SpecialtyDistribution {
  specialty: string;
  count: number;
  percentage: number;
}

export const adminDashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const token = localStorage.getItem('access_token');
    return apiRequest<DashboardMetrics>({
      method: 'GET',
      path: '/admin/dashboard/metrics',
      token,
    });
  },

  async getSpecialtiesDistribution(): Promise<SpecialtyDistribution[]> {
    const token = localStorage.getItem('access_token');
    return apiRequest<SpecialtyDistribution[]>({
      method: 'GET',
      path: '/admin/dashboard/specialties-distribution',
      token,
    });
  },
};
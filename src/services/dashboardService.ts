import { apiRequest } from './api';
import type { DashboardStats } from '../types/dashboard';

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/dashboard/stats');
}

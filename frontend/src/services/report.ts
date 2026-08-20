import api from './api';
import { Report } from '../types';

export const reportService = {
  async getAll(workspaceId?: number): Promise<Report[]> {
    const params = workspaceId ? `?workspaceId=${workspaceId}` : '';
    const response = await api.get<Report[]>(`/reports${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async generate(data: {
    workspaceId: number;
    type: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<Report> {
    const response = await api.post<Report>('/reports/generate', data);
    return response.data;
  },

  async downloadPdf(id: number): Promise<Blob> {
    const response = await api.get(`/reports/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/reports/${id}`);
  },
};

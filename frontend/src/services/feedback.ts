import api from './api';
import { Feedback, FeedbackFilter, PaginatedResponse, CSVUploadResult } from '../types';

export const feedbackService = {
  async getAll(filters?: FeedbackFilter): Promise<PaginatedResponse<Feedback>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.append('page', String(filters.page));
    if (filters?.size !== undefined) params.append('size', String(filters.size));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sentiment) params.append('sentiment', filters.sentiment);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortDir) params.append('sortDir', filters.sortDir);

    const response = await api.get<PaginatedResponse<Feedback>>(`/feedback?${params}`);
    return response.data;
  },

  async getById(id: number): Promise<Feedback> {
    const response = await api.get<Feedback>(`/feedback/${id}`);
    return response.data;
  },

  async create(data: Partial<Feedback>): Promise<Feedback> {
    const response = await api.post<Feedback>('/feedback', data);
    return response.data;
  },

  async update(id: number, data: Partial<Feedback>): Promise<Feedback> {
    const response = await api.put<Feedback>(`/feedback/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/feedback/${id}`);
  },

  async importCSV(file: File, workspaceId: number): Promise<CSVUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', String(workspaceId));
    const response = await api.post<CSVUploadResult>('/feedback/import', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  async getStats(workspaceId?: number) {
    const params = workspaceId ? `?workspaceId=${workspaceId}` : '';
    const response = await api.get(`/feedback/stats${params}`);
    return response.data;
  },
};

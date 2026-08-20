import api from './api';
import { Workspace } from '../types';

export const workspaceService = {
  async getAll(): Promise<Workspace[]> {
    const response = await api.get<Workspace[]>('/workspaces');
    return response.data;
  },

  async getById(id: number): Promise<Workspace> {
    const response = await api.get<Workspace>(`/workspaces/${id}`);
    return response.data;
  },

  async create(data: Partial<Workspace>): Promise<Workspace> {
    const response = await api.post<Workspace>('/workspaces', data);
    return response.data;
  },

  async update(id: number, data: Partial<Workspace>): Promise<Workspace> {
    const response = await api.put<Workspace>(`/workspaces/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/workspaces/${id}`);
  },
};

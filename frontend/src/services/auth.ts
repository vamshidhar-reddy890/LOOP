import api from './api';
import { LoginRequest, SignupRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/auth/profile', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/password', { oldPassword, newPassword });
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
};

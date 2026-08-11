import { api } from './api';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, pass: string): Promise<LoginResponse> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password: pass,
    });
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

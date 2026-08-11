import { api } from './api';
import { ApiResponse, Challan } from '../types';

export const challanService = {
  getChallans: async (params?: {
    search?: string;
    status?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<ApiResponse<Challan[]>>('/challans', { params });
    return res.data;
  },

  getChallanById: async (id: string): Promise<Challan> => {
    const res = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return res.data.data;
  },

  createDraftChallan: async (data: {
    customerId: string;
    items: { productId: string; quantity: number }[];
  }): Promise<Challan> => {
    const res = await api.post<ApiResponse<Challan>>('/challans', data);
    return res.data.data;
  },

  confirmChallan: async (id: string): Promise<Challan> => {
    const res = await api.patch<ApiResponse<Challan>>(`/challans/${id}/confirm`);
    return res.data.data;
  },

  cancelChallan: async (id: string): Promise<Challan> => {
    const res = await api.patch<ApiResponse<Challan>>(`/challans/${id}/cancel`);
    return res.data.data;
  },
};
